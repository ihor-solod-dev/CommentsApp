import { startConsumer } from './rabbitmq';

async function bootstrap() {
    await startConsumer();
    console.log('SMTP Service started, consuming email queue');
}

bootstrap().catch(console.error);