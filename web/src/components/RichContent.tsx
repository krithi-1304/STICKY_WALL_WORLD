import type { CSSProperties, ReactNode } from 'react';
import { safeLink } from '../domain/presentation';
export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  const safe = safeLink(href); if (!safe) return <>{children}</>;
  return <a href={safe} target="_blank" rel="noopener noreferrer" onClick={e => { if (!window.confirm(`Open ${new URL(safe).hostname} in another tab? This leaves your private archive and connects to an external site.`)) e.preventDefault(); }}>{children}</a>;
}
/** Allowlisted Markdown tokens become React elements. HTML is always literal text. */
export function RichContent({ text, reveal = false }: { text: string; reveal?: boolean }) {
  let count = 0;
  const ink = (value: string) => {
    if (!reveal) return value;
    const remaining = Math.max(0, 300 - count);
    const letters = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)];
    const animated = letters.slice(0, remaining);
    const tail = letters.slice(remaining).map(({ segment }) => segment).join('');
    return <><span className="sr-only">{value}</span><span aria-hidden="true">{animated.map(({ segment }, i) => <span className="shared-ink" key={i} style={{ '--ink-delay': `${Math.min(count++ * 13, 1200)}ms` } as CSSProperties}>{segment}</span>)}{tail && <span className="shared-ink" style={{ '--ink-delay': '1200ms' } as CSSProperties}>{tail}</span>}</span></>;
  };
  const parts = text.split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\([^\s)]+\)|https?:\/\/[^\s<>]+)/g);
  return <div className="rich-content">{parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{ink(part.slice(2,-2))}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={i}>{ink(part.slice(1,-1))}</em>;
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) return <ExternalLink key={i} href={link[2]}>{link[1]}</ExternalLink>;
    if (/^https?:\/\//.test(part)) return <ExternalLink key={i} href={part}>{part}</ExternalLink>;
    return <span key={i}>{ink(part)}</span>;
  })}</div>;
}
export function SupportLine() { return <p className="support-line">If writing brings up something difficult, <ExternalLink href="https://findahelpline.com/">find someone to talk to</ExternalLink>.</p>; }
