import { AiProvider } from './ai.provider.interface';
import { GroqProvider } from './groq.provider';
import { config } from '../config';

export function createAiProvider(): AiProvider {
    switch (config.aiProvider) {
        case 'groq':
            return new GroqProvider();
        default:
            throw new Error(`Unknown AI provider: ${config.aiProvider}`);
    }
}