import express from 'express';
import cors from 'cors';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(__dirname, '..', 'data'), { recursive: true });

await import('./db.js');

const { default: servicesRouter } = await import('./routes/services.js');
const { default: appointmentsRouter } = await import('./routes/appointments.js');
const { default: authRouter } = await import('./routes/auth.js');

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 4001;

const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin);
    const isVercel = /^https:\/\/[\w-]+\.vercel\.app$/.test(origin);
    if (isAllowed || isVercel) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'CitaBook API funcionando' });
});

app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/appointments', appointmentsRouter);

const server = app.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ El puerto ${PORT} ya está en uso.`);
    console.error('   Cierra la otra instancia o usa otro puerto:');
    console.error(`   $env:API_PORT=4002; npm run dev\n`);
    process.exit(1);
  }
  throw err;
});
