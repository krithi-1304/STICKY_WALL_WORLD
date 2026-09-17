import { create } from 'zustand';

function savedSound() {
  try { return localStorage.getItem('black-wall:sound') === 'on'; } catch { return false; }
}
export const useSound = create<{ enabled: boolean; toggle: () => void }>((set) => ({
  enabled: savedSound(),
  toggle: () => set((s) => {
    const enabled = !s.enabled;
    try { localStorage.setItem('black-wall:sound', enabled ? 'on' : 'off'); } catch { /* session preference still works */ }
    if (enabled) void playRoomChime(true);
    else if (context?.state === 'running') void context.suspend().catch(() => {});
    return { enabled };
  }),
}));
let context: AudioContext | undefined;
let lastChime = -Infinity;
export async function playRoomChime(preview = false, voice = 'welcome') {
  if ((!preview && !useSound.getState().enabled) || document.hidden || performance.now() - lastChime < 700) return;
  lastChime = performance.now();
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') await context.resume();
    if (context.state !== 'running' || (!preview && !useSound.getState().enabled)) return;
    const audio = context;
    const seed = [...voice].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0);
    const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];
    const root = notes[seed % notes.length];
    const intervals = seed % 2 ? [1, 1.5, 2.002] : [1, 1.25, 1.875];
    intervals.map(ratio => root * ratio).forEach((frequency, i) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const start = audio.currentTime + i * (.055 + seed % 4 * .025);
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.012 / (i + 1), start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .65 + seed % 5 * .08);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start); oscillator.stop(start + 1.05);
    });
  } catch { /* sound must never block navigation */ }
}
