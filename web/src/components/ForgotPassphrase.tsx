import { HelpGuide } from './HelpGuide';
import { useState } from 'react';
import { exportLockedVault, startFreshVault, type Envelope } from '../domain/storage';
import { useWall } from '../state/wall';

export function ForgotPassphrase({ onCancel, onCreated }: { onCancel: () => void; onCreated: () => void }) {
  const [exported, setExported] = useState<Envelope | null>(null);
  const [pass, setPass] = useState('');
  const [repeat, setRepeat] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <main className="vault-page"><form className="vault-panel glass" onSubmit={async e => {
    e.preventDefault(); setError('');
    if (!exported || confirmation !== 'START FRESH') return;
    if (pass !== repeat) { setError('The passphrases do not match.'); return; }
    setBusy(true);
    try { await startFreshVault(pass, exported); useWall.setState({ rooms: [], stickies: [] }); onCreated(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not start a new archive.'); }
    finally { setBusy(false); }
  }}>
    <HelpGuide /><h1>Forgot your passphrase?</h1>
    <p>Check your password manager first. If your notes are still open in another tab, keep it open: you can change the passphrase there without losing your notes.</p>
    <p>If every tab is locked, there is no way to decrypt the old notes without their original passphrase. A backup needs that passphrase too.</p>
    <h2>Start a new, empty archive</h2>
    <p>This replaces the archive in this browser. First download its encrypted copy and check that the file was saved. It lets you restore the old notes if you remember their passphrase later.</p>
    <button type="button" disabled={busy} onClick={async () => { setError(''); try { setExported(await exportLockedVault()); } catch (e) { setError(e instanceof Error ? e.message : 'Download failed.'); } }}>Download old encrypted archive</button>
    {exported && <>
      <label>New passphrase<input type="password" autoComplete="new-password" minLength={12} maxLength={200} required value={pass} onChange={e => setPass(e.target.value)} disabled={busy} /></label>
      <label>Repeat new passphrase<input type="password" autoComplete="new-password" minLength={12} maxLength={200} required value={repeat} onChange={e => setRepeat(e.target.value)} disabled={busy} /></label>
      <label>Type START FRESH to confirm you saved the file and want an empty archive<input autoComplete="off" required value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy} /></label>
      <button className="primary" disabled={busy || confirmation !== 'START FRESH'}>{busy ? 'Creating…' : 'Replace with empty archive'}</button>
    </>}
    {error && <p role="alert">{error}</p>}
    <button type="button" disabled={busy} onClick={onCancel}>Back to unlock</button>
  </form></main>;
}
