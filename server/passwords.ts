import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

const KEY_LENGTH = 64;

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, KEY_LENGTH, {
      N: 16_384,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024
    }, (error, key) => error ? reject(error) : resolve(key as Buffer));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await deriveKey(password, salt);

  return `scrypt$16384$8$1$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [algorithm, cost, blockSize, parallelism, saltHex, keyHex] = encoded.split('$');
  if (algorithm !== 'scrypt' || cost !== '16384' || blockSize !== '8' || parallelism !== '1') return false;
  if (!/^[a-f\d]{32}$/i.test(saltHex || '') || !/^[a-f\d]{128}$/i.test(keyHex || '')) return false;

  const expected = Buffer.from(keyHex, 'hex');
  const actual = await deriveKey(password, Buffer.from(saltHex, 'hex'));

  return timingSafeEqual(actual, expected);
}

export interface PasswordAccountRepository {
  getPasswordHash(accountId: string): Promise<string | null>;
  updatePasswordAndRevokeSessions(accountId: string, passwordHash: string): Promise<void>;
}

export async function changeAccountPassword(
  repository: PasswordAccountRepository,
  accountId: string,
  currentPassword: string,
  newPassword: string
): Promise<'changed' | 'invalid-current' | 'invalid-new'> {
  if (newPassword.length < 8 || newPassword.length > 256) return 'invalid-new';
  if (currentPassword.length > 256) return 'invalid-current';

  const currentHash = await repository.getPasswordHash(accountId);
  if (!currentHash || !(await verifyPassword(currentPassword, currentHash))) return 'invalid-current';

  await repository.updatePasswordAndRevokeSessions(accountId, await hashPassword(newPassword));
  return 'changed';
}