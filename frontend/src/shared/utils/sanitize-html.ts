const ALLOWED_TAGS: Record<string, string[]> = {
    a: ['href', 'title'],
    code: [],
    i: [],
    strong: [],
};

function processNode(node: ChildNode): string {
    if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const children = Array.from(el.childNodes).map(processNode).join('');

    if (!ALLOWED_TAGS[tag]) return children;

    const allowedAttrs = ALLOWED_TAGS[tag];
    let attrs = '';

    for (const attr of allowedAttrs) {
        const val = el.getAttribute(attr);
        if (val !== null) {
            if (attr === 'href') {
                if (/^https?:\/\//i.test(val)) {
                    attrs += ` href="${val.replace(/"/g, '&quot;')}"`;
                }
            } else {
                attrs += ` ${attr}="${val.replace(/"/g, '&quot;')}"`;
            }
        }
    }

    if (tag === 'a') {
        attrs += ' target="_blank" rel="noopener noreferrer"';
    }

    return `<${tag}${attrs}>${children}</${tag}>`;
}

export function sanitizeForDisplay(html: string): string {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    return Array.from(div.childNodes).map(processNode).join('');
}

export function validateCommentText(text: string): string | null {
    if (!text.trim()) return 'Коментар не може бути порожнім';
    if (text.length > 10000) return 'Занадто довгий коментар (максимум 10 000 символів)';

    const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
        const tag = match[1].toLowerCase();
        if (!ALLOWED_TAGS[tag]) {
            return `Тег <${tag}> заборонений. Дозволені: ${Object.keys(ALLOWED_TAGS).join(', ')}`;
        }
    }

    return null;
}