import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createSupabaseStaffRouter } from '../server/supabase-staff';

const owner = { id:'owner-id', role:'super_admin', adminType:'owner', status:'active' };
const admin = { id:'admin-id', role:'admin', adminType:'admin', status:'active' };
async function fixture(mock: (action: string, body: any, headers: Headers) => Response | Promise<Response>) {
  const app = express(); app.use(express.json());
  app.use('/api/v1/admin', createSupabaseStaffRouter((async (url, options) => mock(String(url).split('/').pop()!, JSON.parse(String(options?.body)), new Headers(options?.headers))) as typeof fetch));
  const server = app.listen(0, '127.0.0.1'); await new Promise<void>(resolve => server.once('listening',resolve));
  const port = (server.address() as {port:number}).port;
  return { request: (path: string, options?: RequestInit) => fetch(`http://127.0.0.1:${port}/api/v1/admin${path}`, options), close: () => new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve())) };
}
const json = (data: unknown, status=200) => Response.json(data,{status});
test('unsigned protected APIs return 401 without querying privileged operations', async () => {
  const f = await fixture(()=>{ throw new Error('must not call'); });
  try { assert.equal((await f.request('/accounts')).status,401); } finally { await f.close(); }
});
test('cross-origin login is rejected before contacting Supabase', async () => {
  const f=await fixture(()=>{throw new Error('must not call');});
  try { assert.equal((await f.request('/auth/login',{method:'POST',headers:{origin:'https://attacker.example','content-type':'application/json'},body:JSON.stringify({adminType:'owner',password:'secret'})})).status,403); } finally { await f.close(); }
});
test('login returns only profile and puts tokens in HttpOnly cookies', async () => {
  const f=await fixture((action,body)=>{assert.equal(action,'login');assert.equal(body.adminType,'owner');return json({user:owner,session:{access_token:'access-secret',refresh_token:'refresh-secret',expires_in:3600}});});
  try {
    const response=await f.request('/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({adminType:'owner',password:'entered-password'})});
    assert.deepEqual(await response.json(),{user:owner});
    const cookies=response.headers.getSetCookie();assert.equal(cookies.length,2);
    assert(cookies.every(cookie=>cookie.includes('HttpOnly')&&cookie.includes('SameSite=Strict')));
  } finally { await f.close(); }
});
test('Admin cannot list accounts even with an owner role cookie', async () => {
  const f=await fixture((action)=>{assert.equal(action,'session');return json({user:admin});});
  try { assert.equal((await f.request('/accounts',{headers:{cookie:'safa_access=admin-token; role=super_admin'}})).status,403); } finally { await f.close(); }
});
test('expired access refreshes through Supabase and rotates server cookies', async () => {
  const calls:string[]=[];const f=await fixture(action=>{calls.push(action);return action==='session'?json({error:'expired'},401):json({user:owner,session:{access_token:'new',refresh_token:'rotated',expires_in:3600}});});
  try { const response=await f.request('/auth/session',{headers:{cookie:'safa_access=old; safa_refresh=valid'}});assert.equal(response.status,200);assert.deepEqual(calls,['session','refresh']);assert(response.headers.getSetCookie()[1].includes('rotated'));assert.deepEqual(await response.json(),{user:owner}); } finally { await f.close(); }
});
test('Supabase outage returns 503 and keeps refresh cookie for retry', async () => {
  const f=await fixture(()=>{throw new Error('offline');});
  try { const response=await f.request('/auth/session',{headers:{cookie:'safa_access=valid; safa_refresh=valid'}});assert.equal(response.status,503);assert.equal(response.headers.get('set-cookie'),null); } finally { await f.close(); }
});
test('Owner resetting Admin does not clear Owner cookies', async () => {
  const f=await fixture(action=>json(action==='session'?{user:owner}:{success:true,signedOut:false}));
  try {const response=await f.request('/auth/change-password',{method:'POST',headers:{cookie:'safa_access=owner-token','content-type':'application/json'},body:JSON.stringify({targetType:'admin'})});assert.equal(response.status,200);assert.equal(response.headers.get('set-cookie'),null);} finally {await f.close();}
});
test('self password change clears both session cookies',async()=>{
  const f=await fixture(action=>json(action==='session'?{user:admin}:{success:true,signedOut:true}));
  try {const response=await f.request('/auth/change-password',{method:'POST',headers:{cookie:'safa_access=admin-token','content-type':'application/json'},body:'{}'});assert.equal(response.status,200);assert(response.headers.getSetCookie().every(cookie=>cookie.includes('Max-Age=0')));}finally{await f.close();}
});
test('server refuses email-based login and a forged access token',async()=>{
  const f=await fixture(()=>json({error:'Invalid session'},401));
  try {assert.equal((await f.request('/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'owner@example.com',password:'secret'})})).status,400);assert.equal((await f.request('/auth/session',{headers:{cookie:'safa_access=forged'}})).status,401);}finally{await f.close();}
});
