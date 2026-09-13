import { createApp } from './app';
import { config } from './config';

const app = createApp();
app.listen(config.port, () => {
    console.log(`AI Translator running on port ${config.port}`);
});