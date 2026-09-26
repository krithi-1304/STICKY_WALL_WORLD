import { useCallback, useEffect, useId, useRef, useState } from 'react';
import guide from '../content/help.md?raw';
import guideUrl from '../content/help.md?url';

const sections = guide.split('\n## ').slice(1).map((section, index) => {
  const newline = section.indexOf('\n');
  return { id: index, title: section.slice(0, newline), body: section.slice(newline).trim() };
});

/** Contextual help preserves drafts and works inside the note editor's focus boundary. */
export function HelpGuide() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return <><button type="button" className="help-trigger" onClick={() => setOpen(true)}>Help & guide</button>{open && <GuideDialog onClose={close} />}</>;
}

function GuideDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  const [query, setQuery] = useState('');
  const words = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = sections.filter(section => words.every(word => `${section.title} ${section.body}`.toLowerCase().includes(word)));
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const element = dialog.current;
    element?.showModal();
    const hide = () => onClose();
    window.addEventListener('black-wall:hide', hide);
    return () => { window.removeEventListener('black-wall:hide', hide); element?.close(); previous?.focus(); };
  }, [onClose]);
  return <dialog ref={dialog} className="help-guide" aria-labelledby={heading} onCancel={e => { e.preventDefault(); onClose(); }}>
    <header className="help-guide__header"><div><h2 id={heading}>Your guide to The Black Wall</h2><p>From your first thought to keeping it safe.</p></div><button type="button" onClick={onClose} autoFocus>Close help</button></header>
    <div className="help-guide__search"><label htmlFor={`${heading}-search`}>Find a feature or question</label><input id={`${heading}-search`} type="search" placeholder="Try backups, chimes, or locked notes" value={query} onChange={e => setQuery(e.target.value)} /><div className="help-guide__tools"><span role="status">{visible.length} of {sections.length} topics</span><a href={guideUrl} download="The-Black-Wall-Guide.md">Download guide</a><button type="button" onClick={() => window.dispatchEvent(new Event('black-wall:hide'))}>Hide screen</button></div></div>
    <div className="help-guide__topics">{visible.length ? visible.map(section => <details key={`${section.id}-${!!words.length}`} open={words.length > 0 || section.id === 0}><summary>{section.title}</summary><div>{section.body.split('\n\n').map((block, index) => /^\d+\. /.test(block) ? <ol key={index}>{block.split('\n').map((line, lineIndex) => <li key={lineIndex}>{line.replace(/^\d+\. /, '')}</li>)}</ol> : <p key={index}>{block}</p>)}</div></details>) : <p className="help-guide__empty">No topics match “{query}”. Try a shorter word, or <button type="button" onClick={() => setQuery('')}>Show all topics</button>.</p>}</div>
  </dialog>;
}
