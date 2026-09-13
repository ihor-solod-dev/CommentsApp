import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from '../config';

export interface UploadTokenPayload {
    fileId: string;
    userId: number;
    mimeType: string;
}

export function verifyUploadToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['x-upload-token'] as string;
    if (!token) {
        res.status(401).json({ success: false, error: 'Missing upload token' });
        return;
    }

    try {
        const payload = jwt.verify(token, config.filesServiceSecret) as UploadTokenPayload;
        req.uploadPayload = payload;
        next();
    } catch {
        res.status(401).json({ success: false, error: 'Invalid or expired upload token' });
    }
}

declare global {
    namespace Express {
        interface Request {
            uploadPayload?: UploadTokenPayload;
        }
    }
}