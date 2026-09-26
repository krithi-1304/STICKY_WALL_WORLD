import { HelpGuide } from './HelpGuide';
import { PassphraseDialog } from './PassphraseDialog';
import { useState } from 'react';
import { exportVault, saveWorld, useStorage } from '../domain/storage';
import { useWall } from '../state/wall';

/** Modal dialogs must keep recovery and panic hide within their focus boundary. */
export function ArchiveTools() {
  const [changing, setChanging] = useState(false);
  const storage = useStorage();
  const [error, setError] = useState('');
  return <div className="editor-privacy"><HelpGuide />
    <button type="button" onClick={() => void exportVault(useWall.getState()).catch(e => setError(e.message))}>Export encrypted backup</button>
    <button type="button" onClick={() => setChanging(true)}>Change passphrase</button>
    <button type="button" onClick={() => window.dispatchEvent(new Event('black-wall:hide'))}>Hide screen</button>
    {storage.status === 'error' && <button type="button" onClick={() => saveWorld(useWall.getState())}>Retry saving</button>}
    {(storage.error || error) && <p role="alert">{storage.error || error}</p>}
    {changing && <PassphraseDialog onClose={() => setChanging(false)}/>}
  </div>;
}
