import assert from 'node:assert/strict';
import test from 'node:test';
import { changeAccountPassword, hashPassword, verifyPassword, type PasswordAccountRepository } from '../server/passwords';

class MemoryAccounts implements PasswordAccountRepository {
  passwords = new Map<string, string>();
  sessions = new Map<string, Set<string>>();

  async getPasswordHash(accountId: string): Promise<string | null> {
    return this.passwords.get(accountId) || null;
  }

  async updatePasswordAndRevokeSessions(accountId: string, passwordHash: string): Promise<void> {
    this.passwords.set(accountId, passwordHash);
    this.sessions.set(accountId, new Set());
  }
}

test('passwords are stored as unique salted hashes and verified without plaintext storage', async () => {
  const firstHash = await hashPassword('previous-password');
  const secondHash = await hashPassword('previous-password');

  assert.notEqual(firstHash, 'previous-password');
  assert.notEqual(firstHash, secondHash);
  assert.equal(await verifyPassword('previous-password', firstHash), true);
  assert.equal(await verifyPassword('not-the-password', firstHash), false);
});

test('password change rejects a wrong current password without modifying the account', async () => {
  const repository = new MemoryAccounts();
  repository.passwords.set('admin-a', await hashPassword('old-password'));
  repository.sessions.set('admin-a', new Set(['session-a1']));

  const result = await changeAccountPassword(repository, 'admin-a', 'wrong-password', 'new-password');

  assert.equal(result, 'invalid-current');
  assert.equal(await verifyPassword('old-password', repository.passwords.get('admin-a')!), true);
  assert.deepEqual([...repository.sessions.get('admin-a')!], ['session-a1']);
});

test('password change accepts the new password and revokes only that administrator sessions', async () => {
  const repository = new MemoryAccounts();
  repository.passwords.set('admin-a', await hashPassword('old-password'));
  repository.passwords.set('admin-b', await hashPassword('other-admin-password'));
  repository.sessions.set('admin-a', new Set(['session-a1', 'session-a2']));
  repository.sessions.set('admin-b', new Set(['session-b1']));

  const result = await changeAccountPassword(repository, 'admin-a', 'old-password', 'new-password');

  assert.equal(result, 'changed');
  assert.equal(await verifyPassword('old-password', repository.passwords.get('admin-a')!), false);
  assert.equal(await verifyPassword('new-password', repository.passwords.get('admin-a')!), true);
  assert.equal(await verifyPassword('other-admin-password', repository.passwords.get('admin-b')!), true);
  assert.deepEqual([...repository.sessions.get('admin-a')!], []);
  assert.deepEqual([...repository.sessions.get('admin-b')!], ['session-b1']);
});

test('password change enforces minimum length', async () => {
  const repository = new MemoryAccounts();
  repository.passwords.set('admin-a', await hashPassword('old-password'));

  const result = await changeAccountPassword(repository, 'admin-a', 'old-password', 'short');

  assert.equal(result, 'invalid-new');
  assert.equal(await verifyPassword('old-password', repository.passwords.get('admin-a')!), true);
});