import * as amqp from 'amqplib';
import { config } from './config';

let connection: amqp.ChannelModel;
let channel: amqp.Channel;

export async function connectRabbitMQ() {
    connection = await amqp.connect(config.rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertQueue(config.emailQueue, { durable: true });
}

export async function publishEmailJob(job: {
    to: string;
    username: string;
    totalComments: number;
    totalScore: number;
}) {
    channel.sendToQueue(
        config.emailQueue,
        Buffer.from(JSON.stringify(job)),
        { persistent: true },
    );
}