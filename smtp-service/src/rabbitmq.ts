import * as amqp from 'amqplib';
import { config } from './config';
import { sendDailyStats } from './mailer';

export async function startConsumer() {
    const connection = await amqp.connect(config.rabbitmqUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(config.emailQueue, { durable: true });
    channel.prefetch(config.prefetchCount);

    channel.consume(config.emailQueue, async (msg) => {
        if (!msg) return;

        try {
            const job = JSON.parse(msg.content.toString());
            await sendDailyStats(job);
            channel.ack(msg);
        } catch (err) {
            console.error('Failed to send email:', err);
            channel.nack(msg, false, true);
        }
    });
}