import sharp from 'sharp';
import { config } from '../config';

export async function resizeImageIfNeeded(
    buffer: Buffer,
    mimeType: string,
): Promise<Buffer> {
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(mimeType)) {
        return buffer;
    }

    const image = sharp(buffer);
    const meta = await image.metadata();

    if (
        (meta.width ?? 0) <= config.maxImageWidth &&
        (meta.height ?? 0) <= config.maxImageHeight
    ) {
        return buffer;
    }

    return image
        .resize(config.maxImageWidth, config.maxImageHeight, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .toBuffer();
}