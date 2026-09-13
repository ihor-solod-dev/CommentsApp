import * as crypto from 'crypto';
import * as path from 'path';

export function hashFilename(
    userId: number,
    originalName: string,
): string {
    const ext = path.extname(originalName).toLowerCase();
    const raw = `${Date.now()}-${userId}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    return `${hash}${ext}`;
}