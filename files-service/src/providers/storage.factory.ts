import { StorageProvider } from './storage.provider.interface';
import { LocalStorageProvider } from './local.provider';
import { config } from '../config';

export function createStorageProvider(): StorageProvider {
    switch (config.storageProvider) {
        case 'local':
            return new LocalStorageProvider();
        default:
            throw new Error(`Unknown storage provider: ${config.storageProvider}`);
    }
}