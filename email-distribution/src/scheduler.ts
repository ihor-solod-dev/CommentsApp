import * as cron from 'node-cron';
import { processAllUsers } from './batch-processor';

export function startScheduler() {
    cron.schedule('0 0 * * *', async () => {
        console.log('Starting daily email distribution...');
        try {
            await processAllUsers();
            console.log('Email distribution tasks queued successfully');
        } catch (err) {
            console.error('Email distribution failed:', err);
        }
    });
}