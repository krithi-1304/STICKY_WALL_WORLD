export function paperTone(color: string) { return color === 'rose' || color === 'blush' ? '#C9A0A0' : color === 'sage' || color === 'mint' ? '#A3B18A' : '#C9BBA8'; }
export function safeLink(value: string) { try { const url = new URL(value); return ['https:','http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; } }
