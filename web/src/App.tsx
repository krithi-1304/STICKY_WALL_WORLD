import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Lobby } from './pages/Lobby';
import { NewRoom } from './pages/NewRoom';
import { Room } from './pages/Room';
import { WorldAtmosphere } from './components/WorldAtmosphere';
import { TorchCursor } from './components/TorchCursor';
import { RainbowFlame } from './components/RainbowFlame';

export function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <WorldAtmosphere />
        <TorchCursor />
        <RainbowFlame />
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/new" element={<NewRoom />} />
          <Route path="/r/:slug" element={<Room />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
