import express from 'express';
import translateRouter from './routes/translate.route';

export function createApp() {
    const app = express();
    app.use(express.json());
    app.use('/translate', translateRouter);
    app.get('/health', (_req, res) => res.json({ status: 'ok' }));
    return app;
}