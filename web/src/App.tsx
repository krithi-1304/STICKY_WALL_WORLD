import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Lobby } from './pages/Lobby';
import { NewRoom } from './pages/NewRoom';
import { Room } from './pages/Room';
import { WorldAtmosphere } from './components/WorldAtmosphere';

export function App() {
  const torchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        torchRef.current?.style.setProperty('--torch-x', `${event.clientX}px`);
        torchRef.current?.style.setProperty('--torch-y', `${event.clientY}px`);
      });
    };
    window.addEventListener('pointermove', move);
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <WorldAtmosphere />
        <div ref={torchRef} className="torch" aria-hidden="true" />
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
