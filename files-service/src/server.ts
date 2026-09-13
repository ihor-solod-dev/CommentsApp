import { createApp } from './app';
import { config } from './config';

const app = createApp();
app.listen(config.port, () => {
    console.log(`Files service running on port ${config.port}`);
});