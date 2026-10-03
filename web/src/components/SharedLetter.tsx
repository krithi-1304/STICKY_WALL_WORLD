import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Sticky } from '../domain/types';
import { RichContent } from './RichContent';
import { Wick } from './Wick';
import { LetterSeal } from './LetterSeal';
import { reducedMotion } from '../domain/motion';
import { paperTone } from '../domain/presentation';

export function SharedLetter({ note, main, seen, index }: { note: Sticky; main: boolean; seen: Set<string>; index: number }) {
  const identity = `${note.id}:${note.updatedAt}`;
  const [opened, setOpened] = useState(!main || seen.has(identity));
  const [reveal, setReveal] = useState(false);
  const letter = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<'rest' | 'opening' | 'folding'>('rest');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const focusNext = useRef(false);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    if (opened) letter.current?.focus({ preventScroll: true });
    else letter.current?.querySelector('button')?.focus({ preventScroll: true });
  }, [opened]);
  function turnLetter(next: boolean) {
    if (phase !== 'rest') return;
    const finish = () => {
      if (next) { setReveal(!seen.has(identity)); seen.add(identity); }
      else setReveal(false);
      focusNext.current = true;
      setOpened(next); setPhase('rest');
    };
    if (reducedMotion()) { finish(); return; }
    setPhase(next ? 'opening' : 'folding');
    timer.current = setTimeout(finish, next ? 440 : 180);
  }
  const media = note.attachments ?? [];
  return <article ref={letter} tabIndex={-1} className={`shared-paper ${main ? 'shared-paper--main' : 'shared-paper--pinned'} ${opened ? 'is-unsealed' : 'is-sealed'} ${reveal ? 'is-revealing' : ''} letter-phase--${phase}`} style={{ '--paper': main ? '#f6e9cf' : paperTone(note.color), '--paper-tilt': `${main ? -1 : index % 2 ? 2 : -2}deg`, '--pin-drop': `${index % 3 * 28}px` } as CSSProperties}>
    {!opened ? <button className="shared-envelope" aria-disabled={phase !== 'rest'} onClick={() => turnLetter(true)}><span className="shared-envelope-greeting">hey… I think this one is for you.</span><span className="shared-envelope-shape"><span className="shared-envelope-insert" aria-hidden="true">a little something,<br/>just for you.</span><span className="shared-envelope-flap"/><LetterSeal seal/><span className="shared-envelope-address">a message for you</span></span><Wick mood="happy" letter/><span className="shared-envelope-prompt">Open your letter <span aria-hidden="true">↗</span></span></button> : <>
      <span className="note-tape" aria-hidden="true"/>
      {main && <><p className="shared-letter-prelude">someone, somewhere, wrote:</p><span className="shared-wax"><LetterSeal seal/></span><div className="shared-letter-wick"><Wick mood="happy"/></div></>}
      {note.body ? <RichContent text={note.body} reveal={reveal}/> : <p className="shared-empty-note">A quiet little note.</p>}
      {media.map(a => <figure className={`shared-media shared-media--${a.type.startsWith('image/') ? 'photo' : a.type.startsWith('audio/') ? 'audio' : 'video'}`} key={a.id}>
        {a.type.startsWith('image/') ? <img src={a.data} alt={a.name} loading="lazy"/> : a.type.startsWith('audio/') ? <><span className="shared-cassette" aria-hidden="true"><i/><span>a voice, kept close</span><i/></span><audio controls preload="metadata" src={a.data}/></> : <video controls preload="metadata" src={a.data}/>}
        <figcaption>{a.name}</figcaption>
      </figure>)}
      {main && <p className="shared-letter-signature">— thinking of you ✦</p>}
      <footer className="shared-paper-footer"><time dateTime={new Date(note.createdAt).toISOString()}>{new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>{main && <button aria-disabled={phase !== 'rest'} onClick={() => turnLetter(false)}>Fold the letter</button>}</footer>
    </>}
  </article>;
}
