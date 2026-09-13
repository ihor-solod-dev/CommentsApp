import { connectRabbitMQ } from './rabbitmq';
import { startScheduler } from './scheduler';

async function bootstrap() {
    await connectRabbitMQ();
    startScheduler();
    console.log('Email Distribution Service started');
}

bootstrap().catch(console.error);