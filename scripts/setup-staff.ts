import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: process.env.SAFA_SETUP_ENV || '.env.setup.local', quiet: true });
// Local-only script. Never expose the secret key in VITE_* or deploy a setup endpoint.
const url = process.env.SUPABASE_URL || 'https://esekwdgunftouzkcrqlx.supabase.co';
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const ownerPassword = process.env.SAFA_OWNER_INITIAL_PASSWORD;
const adminPassword = process.env.SAFA_ADMIN_INITIAL_PASSWORD;
if (!secret || !ownerPassword || !adminPassword) throw new Error('Set SUPABASE_SECRET_KEY, SAFA_OWNER_INITIAL_PASSWORD and SAFA_ADMIN_INITIAL_PASSWORD in the ignored .env.setup.local file.');
if (ownerPassword === adminPassword) throw new Error('Owner and Admin need different passwords.');
if ([ownerPassword, adminPassword].some(password => password.length < 10 || password.length > 128)) throw new Error('Use passwords between 10 and 128 characters.');
const supabase = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const existing = [];
for (let page = 1; ; page++) {
  const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
  if (error) throw new Error(`Could not list Auth users: ${error.message}`);
  existing.push(...data.users);
  if (data.users.length < 1000) break;
}
const ids: Record<string, string> = {};
for (const [type, password] of [['owner', ownerPassword], ['admin', adminPassword]]) {
  const email = `${type}@staff.safa-community.invalid`;
  const current = existing.find(user => user.email === email);
  if (current && current.app_metadata?.safa_role !== type) throw new Error(`Existing ${type} identity was not provisioned as trusted staff. Review it in Supabase before continuing.`);
  if (current) { ids[type] = current.id; console.log(`${type}: kept existing Auth user and password.`); continue; }
  const { data, error } = await supabase.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { safa_role: type } });
  if (error || !data.user) throw new Error(`Could not create ${type}: ${error?.message || 'No user returned'}`);
  ids[type] = data.user.id;
  console.log(`${type}: created confirmed Auth user.`);
}
const { error } = await supabase.rpc('safa_register_staff', { owner_id: ids.owner, admin_id: ids.admin });
if (error) throw new Error(`Users exist, but role registration failed: ${error.message}. You can safely rerun this script.`);
console.log('Owner and Admin registered. Sign in at /admin/login. Remove the local setup file after successful verification.');
