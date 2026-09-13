import { Router, Request, Response } from 'express';
import { createAiProvider } from '../providers/ai.factory';

const router = Router();
const aiProvider = createAiProvider();

router.post('/', async (req, res) => {
    try {
        const { text, targetLang } = req.body;
        if (!text || !targetLang) {
            res.status(400).json({ success: false, error: 'text and targetLang are required' });
            return;
        }
        const translation = await aiProvider.translate(text, targetLang);
        res.json({ success: true, data: { translation } });
    } catch (e) {
        console.error(e);
        res.status(502).json({
            success: false,
            error: e instanceof Error ? e.message : 'Translation failed',
        });
    }
});

export default router;