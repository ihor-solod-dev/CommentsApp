export interface AiProvider {
    translate(text: string, targetLang: string): Promise<string>;
}