import express from 'express';
import cors from 'cors';
import uploadRouter from './routes/upload.route';
import { config } from './config';

export function createApp() {
    const app = express();

    app.use(
        cors({
            origin: process.env.FRONTEND_URL ?? 'http://localhost',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'X-Upload-Token',
                'x-upload-token',
            ],
        }),
    );

    app.use(express.json());
    app.use('/upload', uploadRouter);
    app.use('/files', express.static(config.localStoragePath));
    app.get('/health', (_req, res) => res.json({ status: 'ok' }));

    return app;
}