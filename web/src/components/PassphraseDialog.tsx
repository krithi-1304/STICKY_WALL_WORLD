import { useEffect, useRef, useState } from 'react';
import { changePassphrase } from '../domain/storage';
import { useWall } from '../state/wall';

export function PassphraseDialog({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pass, setPass] = useState('');
  const [repeat, setRepeat] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const element = dialog.current;
    element?.showModal();
    return () => { element?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={dialog} className="vault-panel glass passphrase-dialog" aria-label="Change passphrase" onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}>
    <form onSubmit={async e => {
      e.preventDefault(); setError('');
      if (pass !== repeat) { setError('The passphrases do not match.'); return; }
      setBusy(true);
      try { await changePassphrase(pass, useWall.getState); setPass(''); setRepeat(''); setDone(true); }
      catch (e) { setError(e instanceof Error ? e.message : 'Could not change the passphrase.'); }
      finally { setBusy(false); }
    }}>
      <h1>{done ? 'Your notes are kept' : 'Change passphrase'}</h1>
      {done ? <p role="status">Your notes now use the new passphrase. Export a new backup. Older backups still need their original passphrase.</p> : <>
        <p>This archive is unlocked, so you can keep your notes without entering the old passphrase. Save the new one in your password manager.</p>
        <label>New passphrase<input autoFocus type="password" autoComplete="new-password" required minLength={12} maxLength={200} value={pass} onChange={e => setPass(e.target.value)} disabled={busy} /></label>
        <label>Repeat new passphrase<input type="password" autoComplete="new-password" required minLength={12} maxLength={200} value={repeat} onChange={e => setRepeat(e.target.value)} disabled={busy} /></label>
        <button className="primary" disabled={busy}>{busy ? 'Saving…' : 'Save new passphrase'}</button>
      </>}
      {error && <p role="alert">{error}</p>}
      <button type="button" disabled={busy} onClick={onClose}>{done ? 'Done' : 'Cancel'}</button>
      <button type="button" onClick={() => window.dispatchEvent(new Event('black-wall:hide'))}>Hide screen</button>
    </form>
  </dialog>;
}
