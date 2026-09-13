export const config = {
    rabbitmqUrl: process.env.RABBITMQ_URL ?? 'amqp://localhost',
    emailQueue: 'email.queue',
    smtp: {
        host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT ?? '587', 10),
        user: process.env.SMTP_USER ?? '',
        password: process.env.SMTP_PASSWORD ?? '',
        from: process.env.SMTP_FROM ?? '',
        fromName: process.env.SMTP_FROM_NAME ?? 'Comments App',
    },
    prefetchCount: 5,
};