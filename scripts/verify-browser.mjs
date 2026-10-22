import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

// This checks the real UI against deterministic auth responses. It is not a live Supabase login test.
const port = 32179;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['build/server.cjs'], { env: { ...process.env, PORT:String(port), NODE_ENV:'production' }, stdio:['ignore','pipe','pipe'] });
let output=''; server.stdout.on('data',chunk=>{output+=chunk;}); server.stderr.on('data',chunk=>{output+=chunk;});
let browser;
try {
  for(let attempt=0;attempt<80;attempt++){
    if(server.exitCode!==null) throw new Error(`Server stopped: ${output}`);
    try {const response=await fetch(`${origin}/api/health`);if(response.ok)break;} catch {}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert.equal((await fetch(`${origin}/`)).status,200);
  assert.equal((await fetch(`${origin}/api/v1/admin/auth/session`)).status,401);
  assert(!(await (await fetch(`${origin}/server.cjs`)).text()).includes('createSupabaseStaffRouter'));
  browser=await chromium.launch({headless:true, executablePath:process.env.CHROMIUM_PATH||undefined, args:['--no-sandbox']});
  const context=await browser.newContext({viewport:{width:1365,height:900}});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  let active=null;
  const passwords={owner:'owner-test-password',admin:'admin-test-password'};
  const user=type=>({id:`${type}-id`,name:type==='owner'?'Owner':'Admin',email:'',role:type==='owner'?'super_admin':'admin',status:'active',createdAt:new Date().toISOString()});
  await page.route('**/api/v1/admin/**',async route=>{
    const req=route.request();const action=new URL(req.url()).pathname;
    const body=req.method()==='POST'?req.postDataJSON():{};
    const response=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
    if(action.endsWith('/auth/login')){
      if(passwords[body.adminType]!==body.password)return response({error:'Incorrect admin type or password.'},401);
      active=body.adminType;return response({user:user(active)});
    }
    if(!active)return response({error:'Please sign in again.'},401);
    if(action.endsWith('/auth/session'))return response({user:user(active)});
    if(action.endsWith('/summary'))return response({activeAccounts:2,pendingInvitations:0});
    if(action.endsWith('/auth/logout')){active=null;return response({success:true});}
    if(action.endsWith('/auth/change-password')){
      if(active==='admin'&&body.targetType!=='admin')return response({error:'Owner required'},403);
      if(body.currentPassword!==passwords[active])return response({error:'Current password is incorrect.'},400);
      if(body.newPassword!==body.confirmPassword)return response({error:'Passwords do not match.'},400);
      passwords[body.targetType]=body.newPassword;const signedOut=active===body.targetType;if(signedOut)active=null;
      return response({success:true,signedOut});
    }
    return response({users:[user('owner'),user('admin')]});
  });
  const signIn=async(type,password)=>{await page.locator('#admin-type-select').selectOption(type);await page.locator('#admin-password-input').fill(password);await page.locator('#admin-login-button').click();await page.waitForURL('**/admin/dashboard');};
  const security=async()=>{await page.getByRole('button',{name:'Security',exact:true}).first().click();await page.locator('#password-target').waitFor();};
  const change=async(type,current,next)=>{await page.locator('#password-target').selectOption(type);await page.locator('#current-admin-password').fill(current);await page.locator('#new-admin-password').fill(next);await page.locator('#confirm-admin-password').fill(next);await page.getByRole('button',{name:'Change password',exact:true}).click();};
  await page.goto(`${origin}/admin/dashboard`);await page.waitForURL('**/admin/login');
  assert.equal(await page.locator('input[type=email]').count(),0);
  assert.deepEqual(await page.locator('#admin-type-select option').allTextContents(),['Owner','Admin']);
  await signIn('owner',passwords.owner);await security();
  await change('admin',passwords.owner,'updated-admin-password');
  await page.getByRole('status').filter({hasText:'Admin password changed'}).waitFor();
  assert.equal(new URL(page.url()).pathname,'/admin/dashboard');
  await page.reload();await page.getByRole('button',{name:'Security',exact:true}).first().waitFor();await security();
  const screenshots=process.env.SAFA_SCREENSHOT_DIR||await mkdtemp(path.join(tmpdir(),'safa-auth-ui-'));
  await page.screenshot({path:path.join(screenshots,'security-desktop.png'),fullPage:true});
  await change('owner',passwords.owner,'updated-owner-password');await page.waitForURL('**/admin/login?changed=1&type=owner');
  await page.getByRole('status').filter({hasText:'Password changed'}).waitFor();
  await page.locator('#admin-password-input').fill('owner-test-password');await page.locator('#admin-login-button').click();await page.getByRole('alert').waitFor();
  await signIn('owner',passwords.owner);await page.getByTitle('Log Out').click();await page.waitForURL('**/admin/login');
  await signIn('admin',passwords.admin);await security();
  assert.equal(await page.locator('#password-target option').count(),1);
  assert.equal(await page.locator('#password-target').isDisabled(),true);
  // Admin's target selector is intentionally disabled; submit its own password change directly.
  await page.locator('#current-admin-password').fill(passwords.admin);await page.locator('#new-admin-password').fill('admin-second-password');await page.locator('#confirm-admin-password').fill('admin-second-password');await page.getByRole('button',{name:'Change password',exact:true}).click();await page.waitForURL('**/admin/login?changed=1&type=admin');
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(screenshots,'login-mobile.png'),fullPage:true});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
  await page.unrouteAll();
  let outage=true;
  await page.route('**/api/v1/admin/auth/session',route=>route.fulfill({status:outage?503:401,contentType:'application/json',body:JSON.stringify({error:outage?'Offline':'Sign in'})}));
  await page.goto(`${origin}/admin/dashboard`);await page.getByRole('button',{name:'Retry',exact:true}).waitFor();
  assert.equal(new URL(page.url()).pathname,'/admin/dashboard');
  outage=false;await page.getByRole('button',{name:'Retry',exact:true}).click();await page.waitForURL('**/admin/login');
  assert.deepEqual(errors,[]);
  console.log('Browser checks passed: unsigned redirect, selector, role login, refresh, Security permissions, both password flows, logout, outage retry and mobile layout.');
  console.log(`Internal screenshots: ${screenshots}`);
} finally {
  await browser?.close();
  server.kill('SIGTERM');
  if(server.exitCode===null)await once(server,'exit');
}
