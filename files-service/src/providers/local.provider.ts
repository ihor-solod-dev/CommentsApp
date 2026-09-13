import * as fs from 'fs/promises';
import * as path from 'path';
import { StorageProvider } from './storage.provider.interface';
import { config } from '../config';

export class LocalStorageProvider implements StorageProvider {
    async save(fileBuffer: Buffer, filename: string, _mimeType: string): Promise<string> {
        const dir = config.localStoragePath;
        await fs.mkdir(dir, { recursive: true });
        const filePath = path.join(dir, filename);
        await fs.writeFile(filePath, fileBuffer);
        return filename;
    }

    getPublicUrl(filePath: string): string {
        return `/files/${filePath}`;
    }

    async delete(filePath: string): Promise<void> {
        await fs.unlink(path.join(config.localStoragePath, filePath)).catch(() => { });
    }
}