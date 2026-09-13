export const config = {
    rabbitmqUrl: process.env.RABBITMQ_URL ?? 'amqp://localhost',
    mainApiUrl: process.env.MAIN_API_URL ?? 'http://localhost:3000',
    mainApiSecret: process.env.MAIN_API_INTERNAL_SECRET ?? '',
    batchSize: parseInt(process.env.BATCH_SIZE ?? '50', 10),
    batchDelayMs: parseInt(process.env.BATCH_DELAY_MS ?? '2000', 10),
    emailQueue: 'email.queue',
};