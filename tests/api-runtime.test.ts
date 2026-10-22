import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

// Use emitted JavaScript and native Node ESM resolution: tsx and a bundled
// standalone server can hide missing extensions in the Vercel import graph.
for (const databaseUrl of ['', 'invalid']) {
  test(`Vercel entry serves health and contains upstream Auth outages with DATABASE_URL=${databaseUrl || '(missing)'}`, () => {
    const directory = mkdtempSync(path.join(tmpdir(), 'safa-api-runtime-'));
    try {
      writeFileSync(path.join(directory, 'package.json'), '{"type":"module"}');
      symlinkSync(path.resolve('node_modules'), path.join(directory, 'node_modules'), 'dir');
      for (const source of ['api/index.ts', 'server/app.ts', 'server/supabase-staff.ts']) {
        const destination = path.join(directory, source.replace(/\.ts$/, '.js'));
        mkdirSync(path.dirname(destination), { recursive: true });
        writeFileSync(destination, ts.transpileModule(readFileSync(source, 'utf8'), {
          compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext }
        }).outputText);
      }
      const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
        import assert from 'node:assert/strict';
        import app from './api/index.js';
        const server = app.listen(0, '127.0.0.1');
        await new Promise(resolve => server.once('listening', resolve));
        try {
          const base = 'http://127.0.0.1:' + server.address().port;
          const health = await fetch(base + '/api/health');
          assert.equal(health.status, 200);
          assert.equal((await health.json()).status, 'ok');
          const session = await fetch(base + '/api/v1/admin/auth/session');
          assert.equal(session.status, 401);
          // Repeat to exercise a retryable upstream outage.
          for (let attempt = 0; attempt < 2; attempt++) {
            const login = await fetch(base + '/api/v1/admin/auth/login', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ adminType: 'admin', password: 'test-password' })
            });
            assert.equal(login.status, 503);
            assert.match((await login.json()).error, /temporarily unavailable/);
          }
          assert.equal((await fetch(base + '/api/health')).status, 200);
        } finally {
          await new Promise(resolve => server.close(resolve));
        }
      `], {
        cwd: directory,
        env: { ...process.env, VERCEL: '1', NODE_ENV: 'production', DATABASE_URL: databaseUrl, SUPABASE_URL:'http://127.0.0.1:1', DOTENV_CONFIG_PATH: path.join(directory, '.env') },
        encoding: 'utf8', timeout: 20_000
      });
      assert.equal(result.status, 0, result.stderr || result.error?.message);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
}
