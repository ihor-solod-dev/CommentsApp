import { Router, Request, Response } from 'express';
import multer from 'multer';
import { verifyUploadToken } from '../middleware/verify-token.middleware';
import { createStorageProvider } from '../providers/storage.factory';
import { hashFilename } from '../utils/hash-filename';
import { resizeImageIfNeeded } from '../utils/image-resize';
import { config } from '../config';

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const router = Router();
const storageProvider = createStorageProvider();

router.post('/', verifyUploadToken, upload.single('file'), async (req: Request, res: Response) => {
    const file = req.file;
    const payload = req.uploadPayload!;

    if (!file) {
        res.status(400).json({ success: false, error: 'No file provided' });
        return;
    }

    const { mimeType, userId, fileId } = payload;
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain'];

    if (!allowedMimes.includes(mimeType) || file.mimetype !== mimeType) {
        res.status(400).json({ success: false, error: 'Invalid file type' });
        return;
    }

    if (mimeType === 'text/plain' && file.size > config.maxTxtSizeKb * 1024) {
        res.status(400).json({ success: false, error: 'Text file too large (max 100KB)' });
        return;
    }

    if (['image/jpeg', 'image/png', 'image/gif'].includes(mimeType) && file.size > config.maxImageSizeMb * 1024 * 1024) {
        res.status(400).json({ success: false, error: 'Image too large (max 3MB)' });
        return;
    }

    const processed = await resizeImageIfNeeded(file.buffer, mimeType);
    const filename = hashFilename(userId, file.originalname);
    const savedPath = await storageProvider.save(processed, filename, mimeType);
    const publicUrl = storageProvider.getPublicUrl(savedPath);

    res.json({ success: true, data: { fileId, filePath: publicUrl } });
});

export default router;