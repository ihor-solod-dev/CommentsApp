export const config = {
    port: parseInt(process.env.PORT ?? '3002', 10),
    aiProvider: process.env.AI_PROVIDER ?? 'groq',
    groqApiKey: process.env.GROQ_API_KEY ?? '',
    groqModel: process.env.GROQ_MODEL ?? 'llama3-8b-8192',
};