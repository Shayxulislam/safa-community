import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../worker/index.ts';

test('Worker health endpoint returns API status', async () => {
  const response = await app.request('/api/health');

  assert.equal(response.status, 200);
  const body = await response.json() as { status: string };
  assert.equal(body.status, 'ok');
});

test('Worker info endpoint returns public organization details', async () => {
  const response = await app.request('/api/v1/info');
  const body = await response.json() as { organization: string; socials: unknown[] };

  assert.equal(response.status, 200);
  assert.equal(body.organization, 'SAFA');
  assert.ok(Array.isArray(body.socials));
});

test('Worker returns JSON 404 for unknown API routes', async () => {
  const response = await app.request('/api/v1/not-found');

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: 'API route not found' });
});