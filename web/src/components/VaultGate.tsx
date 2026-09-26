import { HelpGuide } from './HelpGuide';
import { DarkBackdrop } from './DarkBackdrop';
import { FairyLights } from './FairyLights';
import { ForgotPassphrase } from './ForgotPassphrase';
import { PassphraseDialog } from './PassphraseDialog';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWall } from '../state/wall';
import { createVault, openVault, readEnvelope, parseEnvelope, restoreVault, exportVault, forgetKey, saveWorld, useStorage, type Envelope } from '../domain/storage';

export function VaultGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [forgot, setForgot] = useState(false);
  const [changing, setChanging] = useState(false);
  const [envelope, setEnvelope] = useState<Envelope | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [pass, setPass] = useState('');
  const [showPass,setShowPass]=useState(false);
  const [repeat, setRepeat] = useState('');
  const [backup, setBackup] = useState<Envelope | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const storage = useStorage();
  useEffect(() => { readEnvelope().then(value => { setEnvelope(value); setLoaded(true); }).catch(e => setError(String(e.message))); }, []);
  const hide = useCallback(() => {
    setChanging(false); setForgot(false); setHidden(true); setShowPass(false); setPass(''); setRepeat(''); document.title = 'Blank page';
    navigate('/', { replace: true });
    void forgetKey().then(() => { useWall.setState({ rooms: [], stickies: [] }); setReady(false); return readEnvelope(); }).then(setEnvelope).catch(() => { /* Keep unsaved memory available behind the blank screen. */ });
  }, [navigate]);
  useEffect(() => {
    let hold: ReturnType<typeof setTimeout> | undefined;
    const down = (e: KeyboardEvent) => { if (e.key === 'Escape' && !e.repeat) hold = setTimeout(hide, 450); };
    const up = (e: KeyboardEvent) => { if (e.key === 'Escape') clearTimeout(hold); };
    const leaving = (e: BeforeUnloadEvent) => { if (['saving','error'].includes(useStorage.getState().status)) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('beforeunload', leaving);
    window.addEventListener('black-wall:hide', hide);
    return () => { clearTimeout(hold); window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('beforeunload', leaving); window.removeEventListener('black-wall:hide', hide); };
  }, [hide]);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      if (backup) {
        const replacing = !!(await readEnvelope()) || useWall.getState().rooms.length > 0;
        if (replacing && !window.confirm('Replace this browser’s archive with the selected backup? Export your current archive first if you need to keep it.')) return;
        useWall.setState(await restoreVault(pass, backup, replacing)); setEnvelope(backup); setBackup(null);
      } else if (envelope) useWall.setState(await openVault(pass));
      else { if (pass !== repeat) throw new Error('The passphrases do not match.'); await createVault(pass, useWall.getState()); }
      setShowPass(false); setPass(''); setRepeat(''); setReady(true); document.title = 'The Black Wall';
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not open the archive.'); }
    finally { setBusy(false); }
  }
  if (hidden) return <main className="blank-page"><button onClick={() => { setHidden(false); document.title = 'The Black Wall'; }}>Return</button></main>;
  if (!ready && forgot) return <ForgotPassphrase onCancel={() => setForgot(false)} onCreated={() => { setForgot(false); setReady(true); setPass(''); setRepeat(''); navigate('/', { replace: true }); }} />;
  if (!ready) return <main className="vault-page vault-entry"><DarkBackdrop/><FairyLights/><form className="vault-panel glass vault-entry__form" onSubmit={submit}>
    <div className="vault-entry__heading"><p className="eyebrow">THE BLACK WALL</p><HelpGuide /></div><h1>{backup ? 'Restore your archive' : envelope ? 'Welcome back' : 'A place for your thoughts'}</h1>
    <p>{backup ? 'Enter the passphrase used when this backup was exported. Restoring replaces this browser’s archive.' : envelope ? 'Unlock the notes kept in this browser.' : 'No account. No cloud. Choose a passphrase to encrypt your notes on this device.'}</p>
    {!envelope && useWall.getState().rooms.length > 0 && <p>Existing notes will be encrypted before their old unencrypted copy is removed.</p>}
    <label>Passphrase<input type={showPass?'text':'password'} autoComplete={envelope || backup ? 'current-password' : 'new-password'} aria-describedby={!envelope && !backup ? "vault-pass-hint" : undefined} disabled={busy} value={pass} onChange={e => setPass(e.target.value)} required minLength={envelope || backup ? 1 : 12} maxLength={200} /></label>
    {!envelope && !backup && <label>Repeat passphrase<input type={showPass?'text':'password'} autoComplete="new-password" disabled={busy} value={repeat} onChange={e => setRepeat(e.target.value)} required maxLength={200} /></label>}
    <label className="vault-show-pass"><input type="checkbox" checked={showPass} onChange={e=>setShowPass(e.target.checked)}/>Show passphrase</label>
    {!envelope&&!backup&&<p id="vault-pass-hint" className="vault-pass-hint">Use at least 12 characters. A few memorable words work well.</p>}
    <p className="privacy-copy">A forgotten passphrase cannot unlock old notes. Losing it, clearing browser data, or losing this device can permanently lose your notes. Save an encrypted backup after writing. An unlocked archive or a compromised device is not protected by this passphrase.</p>
    <button className="primary" disabled={!loaded || busy}>{busy ? (backup ? 'Restoring…' : envelope ? 'Opening…' : 'Creating…') : backup ? 'Restore backup' : envelope ? 'Unlock archive' : 'Create private archive'}</button>
    {envelope && !backup && <button type="button" disabled={busy} onClick={() => { setPass(''); setRepeat(''); setError(''); setForgot(true); }}>Forgot passphrase?</button>}
    <label className="file-label">Choose an encrypted backup<input type="file" disabled={busy || !loaded} accept=".json,application/json" onChange={async e => { setBackup(null); try { const file = e.target.files?.[0]; if (!file) return; setBackup(parseEnvelope(await file.text())); setError(''); } catch (e) { setError(e instanceof Error ? e.message : 'Invalid backup.'); } }} /></label>
    {backup && <button type="button" disabled={busy} onClick={() => setBackup(null)}>Cancel restore</button>}
    {error && <p role="alert">{error}</p>}
  </form></main>;
  return <><div className="privacy-bar glass"><span role="status">{storage.status === 'saving' ? 'Saving encrypted…' : storage.status === 'error' ? 'Not saved — retry or export' : 'Saved encrypted on this device'}</span>
    <HelpGuide /><button onClick={() => void exportVault(useWall.getState()).catch(e => setError(e.message))}>Export encrypted backup</button>
    <button onClick={() => setChanging(true)}>Change passphrase</button>
    <button onClick={hide} title="Hide immediately. You can also hold Escape.">Hide screen</button>
    {storage.status === 'error' && <button onClick={() => saveWorld(useWall.getState())}>Retry saving</button>}
  </div>{(storage.error || error) && <p className="save-error" role="alert">{storage.error || error}</p>}{children}{changing && <PassphraseDialog onClose={() => setChanging(false)}/>}</>;
}
