import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { app } from './server/app.js';

export { app };
const PORT = Number(process.env.PORT) || 3000;

// ==========================================
// VITE DEV & PRODUCTION STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.VERCEL === '1') {
    return;
  }

  if (process.env.NODE_ENV !== 'production' && !process.argv[1]?.endsWith('server.cjs')) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SAFA Server] Running on http://localhost:${PORT}`);
  });
}

if (process.env.VERCEL !== '1') {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exitCode = 1;
  });
}
