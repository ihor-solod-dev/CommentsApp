import { connectRabbitMQ } from './rabbitmq';
import { processAllUsers } from './batch-processor';

async function main() {
    console.log('Manual email distribution started...');
    await connectRabbitMQ();
    await processAllUsers();
    console.log('Manual email distribution finished');
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});