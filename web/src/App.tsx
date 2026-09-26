import { InteractionFeedback } from './components/InteractionFeedback';
import { Shared } from './pages/Shared';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Lobby } from './pages/Lobby';
import { NewRoom } from './pages/NewRoom';
import { Room } from './pages/Room';
import { TorchCursor } from './components/TorchCursor';
import { VaultGate } from './components/VaultGate';
import { Arrival } from './components/Arrival';

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <InteractionFeedback />
      <Routes><Route path="/shared" element={<Shared/>}/><Route path="*" element={<><Arrival />
      <VaultGate><div className="app">
        <TorchCursor />
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/new" element={<NewRoom />} />
          <Route path="/r/:slug" element={<Room />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div></VaultGate></>}/></Routes>
    </BrowserRouter>
  );
}
