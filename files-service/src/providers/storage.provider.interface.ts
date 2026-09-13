export interface StorageProvider {
    save(fileBuffer: Buffer, filename: string, mimeType: string): Promise<string>;
    getPublicUrl(filePath: string): string;
    delete(filePath: string): Promise<void>;
}