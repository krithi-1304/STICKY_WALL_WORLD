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
export async function playRoomChime(preview = false) {
  if ((!preview && !useSound.getState().enabled) || document.hidden || performance.now() - lastChime < 700) return;
  lastChime = performance.now();
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') await context.resume();
    if (context.state !== 'running' || (!preview && !useSound.getState().enabled)) return;
    const audio = context;
    [659.25, 880, 1318.5].forEach((frequency, i) => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const start = audio.currentTime + i * .06;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.012 / (i + 1), start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .85);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start); oscillator.stop(start + .9);
    });
  } catch { /* sound must never block navigation */ }
}
