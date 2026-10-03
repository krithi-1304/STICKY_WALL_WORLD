import { useEffect, useRef, useState, type FormEvent } from 'react';
import { HelpGuide } from '../components/HelpGuide';
import { SharedBackdrop } from '../components/SharedBackdrop';
import { SharedLetter } from '../components/SharedLetter';
import { FallingLetters } from '../components/FallingLetters';
import { Wick } from '../components/Wick';
import { LetterSeal } from '../components/LetterSeal';
import { TorchCursor } from '../components/TorchCursor';
import { parsePrivate, unprotect, type PrivateContent } from '../domain/privateContent';
import { validateWorld, type World } from '../domain/storage';
import { useSound, playRitualSound } from '../domain/chime';
import { reducedMotion } from '../domain/motion';
import '../styles/shared.css';

export function Shared() {
  const sound = useSound();
  const [initial] = useState(() => {
    try {
      if (location.hash.length > 18000000) throw new Error('Too large');
      return { envelope: location.hash ? parsePrivate(JSON.parse(decodeURIComponent(location.hash.slice(1)))) : null, error: '' };
    } catch { return { envelope: null, error: 'This shared link is damaged. Ask the sender for the encrypted file.' }; }
  });
  const generation = useRef(0);
  const transition = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const celebration = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const heading = useRef<HTMLHeadingElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const scene = useRef<HTMLElement>(null);
  // Seen state stays in memory: never record recipient contents or access in storage.
  const [seen] = useState(() => new Set<string>());
  const [envelope, setEnvelope] = useState<PrivateContent | null>(initial.envelope);
  const [world, setWorld] = useState<World | null>(null);
  const [pass, setPass] = useState('');
  const [error, setError] = useState(initial.error);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [opening, setOpening] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [fileName, setFileName] = useState('');
  const [light, setLight] = useState(true);
  const [letters, setLetters] = useState(true);
  const [tabHidden, setTabHidden] = useState(document.hidden);
  useEffect(() => { history.replaceState(null, '', `${import.meta.env.BASE_URL}shared/`); }, []);
  function close(hideScreen = false) {
    generation.current++;
    clearTimeout(transition.current); clearTimeout(celebration.current);
    setWorld(null); setPass(''); setBusy(false); setOpening(false); setCelebrate(false); setRoomId(''); setError(''); setAttempt(0);
    setHidden(hideScreen);
    document.title = hideScreen ? 'Blank page' : 'The Black Wall';
  }
  useEffect(() => {
    const hide = () => close(true);
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) hide(); };
    const visibility = () => setTabHidden(document.hidden);
    window.addEventListener('keydown', key); window.addEventListener('black-wall:hide', hide); document.addEventListener('visibilitychange', visibility);
    const invalidate = () => { generation.current++; clearTimeout(transition.current); clearTimeout(celebration.current); };
    return () => { invalidate(); window.removeEventListener('keydown', key); window.removeEventListener('black-wall:hide', hide); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => { if (world) heading.current?.focus(); else if (!hidden) input.current?.focus({ preventScroll: true }); }, [world, roomId, hidden]);
  useEffect(() => {
    if (!hidden) document.documentElement.dataset.cursor = light ? 'wand' : 'match';
    return () => { delete document.documentElement.dataset.cursor; };
  }, [light, hidden]);
  async function open(e: FormEvent) {
    e.preventDefault();
    if (!envelope || busy) return;
    const operation = ++generation.current;
    setBusy(true); setError('');
    try {
      const content = validateWorld(await unprotect(envelope, pass));
      if (content.rooms.some(r => r.locked) || content.stickies.some(n => n.locked)) throw new Error('This share contains locked items. Ask for a share with locked items excluded.');
      if (operation !== generation.current) return;
      setPass(''); setOpening(true);
      transition.current = setTimeout(() => {
        if (operation !== generation.current) return;
        setWorld(content); setRoomId(content.rooms[0]?.id ?? ''); setOpening(false); setBusy(false);
        if (!reducedMotion()) { setCelebrate(true); celebration.current = setTimeout(() => setCelebrate(false), 3000); }
      }, reducedMotion() ? 100 : 650);
    } catch (e) {
      if (operation === generation.current) {
        setPass(''); setBusy(false); setAttempt(n => n + 1);
        setError(e instanceof Error && e.message.startsWith('This share') ? e.message : 'Not quite… check the phrase with the sender. If it still won’t open, ask for a fresh copy.');
        requestAnimationFrame(() => { if (operation === generation.current) input.current?.focus(); });
      }
    }
  }
  if (hidden) return <main className="blank-page"><button onClick={() => { setHidden(false); document.title = 'The Black Wall'; }}>Return</button></main>;
  const room = world?.rooms.find(r => r.id === roomId) ?? world?.rooms[0];
  const notes = world?.stickies.filter(n => n.roomId === room?.id) ?? [];
  return <main ref={scene} className={`secret-room ${world ? 'shared-world' : 'shared-entry'} ${light ? 'light-on' : 'light-off'} ${opening ? 'is-opening' : ''}`} data-paused={tabHidden} onPointerMove={e => {
    if (light || e.pointerType !== 'mouse' || reducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--match-x', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--match-y', `${e.clientY - r.top}px`);
  }}>
    <SharedBackdrop/><TorchCursor/><FallingLetters enabled={letters}/>
    <nav className="shared-nav" aria-label="Shared invitation"><a href={import.meta.env.BASE_URL}><LetterSeal/>The Black Wall</a><div><HelpGuide/><button onClick={() => close(true)}>Hide screen</button></div></nav>
    {!world ? <section className="shared-invitation" aria-label="Your secret invitation">
      <div className="wick-greeting"><p>psst… someone thought of you ♡</p><Wick key={attempt} mood={opening ? 'happy' : attempt ? 'shy' : 'waiting'} letter/></div>
      <div className="invitation-backing" aria-hidden="true"><span>delivered by moonlight</span></div>
      <form className={`invitation-paper ${error && attempt ? 'has-mistake' : ''}`} onSubmit={open} aria-busy={busy}>
        <span className="invitation-stamp" aria-hidden="true"><LetterSeal seal/></span>
        <h1>A note was<br/>left for you.</h1>
        <p className="invitation-intro">Whisper the secret phrase to open the room.</p>
        <div className="invitation-code" key={attempt}>
          <label htmlFor="shared-phrase">Do you know the secret phrase?</label>
          <input id="shared-phrase" ref={input} aria-label="Share passphrase" type="password" autoComplete="off" required maxLength={200} value={pass} disabled={busy || !envelope} aria-describedby={error ? 'shared-error share-pass-hint' : 'share-pass-hint'} aria-invalid={error ? true : undefined} onChange={e => setPass(e.target.value)} placeholder={attempt ? 'not quite… try again' : 'secret phrase'}/>
          <span className="invitation-keyhole" aria-hidden="true"/>
        </div>
        <p id="share-pass-hint" className="shared-hint" role={!envelope ? 'status' : undefined}>{envelope ? 'The sender keeps the phrase separate from the letter.' : 'Your invitation is missing. Open the full link from the sender, or choose their shared file below. After a refresh, reopen the original link. The secret phrase alone cannot find a message.'}</p>
        <button className="invitation-open" aria-describedby="share-pass-hint" disabled={!envelope || busy}>{busy ? 'Opening your little world…' : 'Open'}<span aria-hidden="true">→</span></button>
        {error && <p id="shared-error" className="shared-error" role="alert">{error}</p>}
        <details className="shared-file" open={!envelope || undefined}><summary>Have a shared file instead?</summary><label>Open shared file<input type="file" accept=".json,application/json" disabled={busy} onChange={async e => {
          const file = e.target.files?.[0]; if (!file) return;
          const operation = ++generation.current; setBusy(true); setError(''); setAttempt(0); setPass('');
          try { const next = parsePrivate(JSON.parse(await file.text())); if (operation === generation.current) { setEnvelope(next); setFileName(file.name); } }
          catch { if (operation === generation.current) { setEnvelope(null); setFileName(''); setError('This file could not be opened. Ask the sender for the original encrypted shared file.'); } }
          finally { if (operation === generation.current) setBusy(false); }
        }}/></label></details>
        {fileName && <p className="shared-file-ready" role="status">Your letter is ready.</p>}
        <p className="invitation-signoff">handle with care ♡</p>
      </form>
    </section> : <section className="shared-room-content" key={room?.id}>
      <header className="shared-room-heading"><p>someone saved you a little space</p><h1 ref={heading} tabIndex={-1}>{room?.name ?? 'A little space for you'}</h1></header>
      {world.rooms.length > 1 && <nav className="shared-room-nav" aria-label="Shared rooms">{world.rooms.map(r => <button key={r.id} aria-current={room?.id === r.id ? 'page' : undefined} onClick={() => setRoomId(r.id)}>{r.name}</button>)}</nav>}
      <div className="shared-notes" aria-label={room?.name ?? 'Shared notes'}>
        {notes.length === 0 && <div className="shared-empty"><Wick/><h2>A little room to breathe</h2><p>No notes were included. Wick will keep the light on.</p></div>}
        {notes.map((note, i) => <SharedLetter key={`${note.id}:${note.updatedAt}`} note={note} main={i === 0} seen={seen} index={i}/>)}
      </div>
      <div className="shared-room-actions"><button onClick={() => close()}>Close the room</button><a href={`${import.meta.env.BASE_URL}?reply=1#first-thought`}>Leave one back ♡</a><p>Write in your own archive, then share it with them.</p></div>
    </section>}
    {celebrate && <div className="shared-celebration" aria-hidden="true">{['♡','✦','♥','♡','✦','♡'].map((s, i) => <span key={i} style={{left:`${18 + i * 13}%`,animationDelay:`${i * 120}ms`}}>{s}</span>)}</div>}
    <footer className="shared-entry-footer"><div className="shared-atmosphere"><button aria-pressed={light} aria-label={light ? 'Turn room light off' : 'Turn room light on'} onClick={() => { if (!light) void playRitualSound('light'); setLight(v => !v); }}><span className="shared-light-switch" aria-hidden="true"/>Light {light ? 'on' : 'off'}</button><button data-sound-toggle aria-pressed={sound.enabled} onClick={sound.toggle}>Sound {sound.enabled ? 'on' : 'off'}</button><button aria-pressed={letters} onClick={() => setLetters(v => !v)}>Falling letters {letters ? 'on' : 'off'}</button></div><p>A private, read-only copy. Not saved to your archive.</p></footer>
  </main>;
}
