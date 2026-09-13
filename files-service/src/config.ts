export const config = {
    port: parseInt(process.env.PORT ?? '3001', 10),
    filesServiceSecret: process.env.FILES_SERVICE_SECRET ?? '',
    storageProvider: process.env.STORAGE_PROVIDER ?? 'local',
    localStoragePath: process.env.LOCAL_STORAGE_PATH ?? '/uploads',
    maxImageSizeMb: 3,
    maxTxtSizeKb: 100,
    maxImageWidth: 320,
    maxImageHeight: 240,
};