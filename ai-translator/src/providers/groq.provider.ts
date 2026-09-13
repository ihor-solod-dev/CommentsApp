import Groq from 'groq-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { AiProvider } from './ai.provider.interface';
import { config } from '../config';

const promptTemplate = fs.readFileSync(
    path.join(__dirname, '../prompts/translate.prompt.txt'),
    'utf-8',
);

export class GroqProvider implements AiProvider {
    private readonly client: Groq;

    constructor() {
        if (!config.groqApiKey) {
            throw new Error('GROQ_API_KEY is not set');
        }

        this.client = new Groq({
            apiKey: config.groqApiKey,
        });
    }

    async translate(text: string, targetLang: string): Promise<string> {
        const prompt = promptTemplate
            .replace('{{targetLang}}', targetLang)
            .replace('{{text}}', text);

        try {
            const response = await this.client.chat.completions.create({
                model: config.groqModel,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.3,
                max_tokens: 1000,
            });

            const content = response.choices?.[0]?.message?.content;
            if (!content) {
                throw new Error('Empty response from Groq');
            }

            return content.trim();
        } catch (err: any) {
            const status = err?.status;
            const errorData = err?.error ?? err?.message ?? err;

            console.error('Groq API error:', status, JSON.stringify(errorData, null, 2));

            throw new Error(
                `Groq API failed (${status ?? 'unknown'}): ${JSON.stringify(errorData)}`,
            );
        }
    }
}