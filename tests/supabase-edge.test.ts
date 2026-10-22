import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

// Run the actual Edge Function body, replacing only its external SDK boundary.
const bundled=await build({entryPoints:['supabase/functions/safa-staff-auth/index.ts'],bundle:true,write:false,format:'iife',platform:'neutral',plugins:[{name:'sdk-boundary',setup(b){b.onResolve({filter:/^npm:/},()=>({path:'sdk',namespace:'fixture'}));b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const createClient = globalThis.sdk;',loader:'js'}));}}]});
function fixture(actor:'owner'|'admin'='owner', revoked=false, outage?: 'identity' | 'database'){
  const passwords={owner:'existing-owner-password',admin:'existing-admin-password'};
  const updates:any[]=[];const revocations:string[]=[];const signOuts:any[]=[];
  const userFor=(type:string)=>({id:`${type}-id`,adminType:type,role:type==='owner'?'super_admin':'admin'});
  let serve!:(req:Request)=>Promise<Response>;
  const sdk=(_url:string,key:string,options:any={})=>{
    const type=options.global?.headers?.Authorization?.includes('admin-')?'admin':actor;
    return {
      rpc:async(name:string,args:any)=>{
        if(name==='safa_auth_attempt')return{data:true};
        if(name==='safa_staff_session' && outage==='database')return{error:{code:'PGRST000'}};
        if(name==='safa_staff_session')return revoked?{error:{code:'28000'}}:{data:userFor(type)};
        if(name==='safa_staff_directory')return {data:[userFor('owner'),userFor('admin')]};
        if(name==='safa_revoke_staff_sessions'){revocations.push(args.target_type);return{};}
        throw new Error(`Unexpected RPC ${name}`);
      },
      auth:{
        getUser:async()=>outage==='identity'?{data:{user:null},error:{status:503}}:({data:{user:{id:`${type}-id`}}}),
        signInWithPassword:async({email,password}:any)=>{
          const selected=email.startsWith('owner@')?'owner':'admin';
          return password===passwords[selected]?{data:{session:{access_token:`${selected}-proof`,refresh_token:'refresh',expires_in:3600}}}:{data:{session:null},error:{status:400,code:'invalid_credentials'}};
        },
        admin:{signOut:async(token:string,scope:string)=>{signOuts.push({token,scope});return{};},updateUserById:async(id:string,value:any)=>{assert.equal(key,'secret');updates.push({id,...value});passwords[id.startsWith('owner')?'owner':'admin']=value.password;return{};}}
      }
    };
  };
  vm.runInNewContext(bundled.outputFiles[0].text,{sdk,Deno:{env:{get:(key:string)=>key==='SUPABASE_SERVICE_ROLE_KEY'?'secret':key==='SUPABASE_URL'?'https://example.supabase.co':'public'},serve:(handler:any)=>{serve=handler;}},Request,Response,URL,TextEncoder,Uint8Array,crypto:webcrypto,console});
  return {updates,revocations,signOuts,request:(action:string,body:any={},signed=true)=>serve(new Request(`https://example.supabase.co/functions/v1/safa-staff-auth/${action}`,{method:'POST',headers:{'content-type':'application/json',...(signed?{authorization:`Bearer ${actor}-access`}:{})},body:JSON.stringify(body)}))};
}
const change={targetType:'admin',currentPassword:'existing-owner-password',newPassword:'new-admin-password!',confirmPassword:'new-admin-password!'};
test('Edge protected endpoints reject unsigned requests',async()=>{assert.equal((await fixture().request('session',{},false)).status,401);});
test('revoked session is rejected even if getUser accepts the JWT',async()=>{assert.equal((await fixture('owner',true).request('session')).status,401);});
test('Admin cannot reset Owner by forging role or target fields',async()=>{const f=fixture('admin');assert.equal((await f.request('password',{...change,targetType:'owner',role:'super_admin',adminType:'owner'})).status,403);assert.equal(f.updates.length,0);assert.equal(f.revocations.length,0);});
test('wrong current password cannot update password or revoke sessions',async()=>{const f=fixture();assert.equal((await f.request('password',{...change,currentPassword:'wrong'})).status,400);assert.equal(f.updates.length,0);assert.equal(f.revocations.length,0);});
test('Owner can reset Admin, revokes Admin sessions and remains signed in',async()=>{const f=fixture();const response=await f.request('password',change);assert.equal(response.status,200);assert.equal((await response.json()).signedOut,false);assert.deepEqual(f.revocations,['admin']);assert.equal(f.updates[0].id,'admin-id');});
test('Admin changes only Admin password and must sign in again',async()=>{const f=fixture('admin');const response=await f.request('password',{...change,currentPassword:'existing-admin-password'});assert.equal(response.status,200);assert.equal((await response.json()).signedOut,true);assert.equal(f.updates[0].id,'admin-id');});
test('Owner and Admin cannot end up with the same password',async()=>{const f=fixture();assert.equal((await f.request('password',{...change,newPassword:'existing-owner-password',confirmPassword:'existing-owner-password'})).status,400);assert.equal(f.updates.length,0);});
test('confirmation and length are checked before any update',async()=>{for(const values of [{newPassword:'short',confirmPassword:'short'},{confirmPassword:'different-password'}]){const f=fixture();assert.equal((await f.request('password',{...change,...values})).status,400);assert.equal(f.updates.length,0);}});

test('Auth identity outage is a retryable 503, not an expired-session response',async()=>{assert.equal((await fixture('owner',false,'identity').request('session')).status,503);});
test('database outage is a retryable 503',async()=>{assert.equal((await fixture('owner',false,'database').request('session')).status,503);});
test('password update finishes with native global sign-out for only the target role',async()=>{const f=fixture();assert.equal((await f.request('password',change)).status,200);assert.deepEqual(f.signOuts.at(-1),{token:'admin-proof',scope:'global'});});
