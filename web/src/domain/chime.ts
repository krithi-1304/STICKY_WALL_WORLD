import { create } from 'zustand';

function savedSound() {
  try { return localStorage.getItem('black-wall:sound') === 'on'; } catch { return false; }
}
export const useSound = create<{ enabled: boolean; toggle: () => void }>((set) => ({
  enabled: savedSound(),
  toggle: () => {
    const enabled = !useSound.getState().enabled;
    soundGeneration++;
    set({ enabled });
    try { localStorage.setItem('black-wall:sound', enabled ? 'on' : 'off'); } catch { /* session preference still works */ }
    if (master && context) master.gain.setValueAtTime(enabled ? 1 : 0, context.currentTime);
    if (enabled) void playRoomChime(true);
    else {
      // Stop voices instead of freezing them with suspend: frozen chimes replay
      // on the next enable and race an in-flight resume during rapid toggles.
      for (const source of sources) { try { source.stop(); } catch { /* already ended */ } }
      sources.clear();
    }
  },
}));
let context: AudioContext | undefined;
let master: GainNode | undefined;
let soundGeneration = 0;
const sources = new Set<AudioScheduledSourceNode>();
function output(audio: AudioContext) {
  if (!master) { master = audio.createGain(); master.gain.value = useSound.getState().enabled ? 1 : 0; master.connect(audio.destination); }
  return master;
}
function track(source: AudioScheduledSourceNode) {
  sources.add(source); source.addEventListener('ended', () => sources.delete(source), { once: true });
}
let lastChime = -Infinity;
export async function playRoomChime(preview = false, voice = 'welcome') {
  if (!useSound.getState().enabled || document.hidden || (!preview && performance.now() - lastChime < 700)) return;
  const generation = soundGeneration;
  lastChime = performance.now();
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') await context.resume();
    if (context.state !== 'running' || !useSound.getState().enabled || generation !== soundGeneration) return;
    const audio = context;
    const seed = [...voice].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0);
    const root = 659.25 * [1,1.122,1.26,1.335][seed % 4] * (1 + (Math.random() * .14 - .07));
    const intervals = [1, 1.5, 2.002];
    intervals.map(ratio => root * ratio).forEach((frequency, i) => {
      const oscillator = audio.createOscillator();
      track(oscillator);
      const gain = audio.createGain();
      const start = audio.currentTime + i * (.055 + seed % 4 * .025);
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(.012 / (i + 1), start + .012);
      gain.gain.exponentialRampToValueAtTime(.0001, start + .65 + seed % 5 * .08);
      oscillator.connect(gain); gain.connect(output(audio));
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      oscillator.start(start); oscillator.stop(start + 1.05);
    });
  } catch { /* sound must never block navigation */ }
}

/** Short synthesized strike/crackle, using the same consent switch as chimes. */
export async function playRitualSound(kind: 'light' | 'burn') {
  if (!useSound.getState().enabled || document.hidden) return;
  const generation = soundGeneration;
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') await context.resume();
    if (!useSound.getState().enabled || generation !== soundGeneration || context.state !== 'running') return;
    const audio = context; const duration = kind === 'light' ? .38 : .65;
    const buffer = audio.createBuffer(1, Math.floor(audio.sampleRate * duration), audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (kind === 'burn' ? Math.random() ** 5 : 1);
    const source = audio.createBufferSource(); track(source); source.buffer = buffer;
    const filter = audio.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = kind === 'light' ? 1900 : 1000;
    const gain = audio.createGain(); const start = audio.currentTime;
    gain.gain.setValueAtTime(.0001,start); gain.gain.exponentialRampToValueAtTime(.07,start+.018); gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
    source.connect(filter); filter.connect(gain); gain.connect(output(audio)); source.start();
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
  } catch { /* Audio never blocks writing. */ }
}

export type SurfaceVoice='paper'|'glass'|'metal'|'light'|'door'|'ink';
let lastSurface=-Infinity;
/** Brief material-specific foley; all voices obey the one master sound preference. */
export async function playSurfaceSound(kind:SurfaceVoice,pressed=false){
  if(!useSound.getState().enabled||document.hidden||performance.now()-lastSurface<(pressed?80:180))return;
  const generation=soundGeneration;
  lastSurface=performance.now();
  try{
    context??=new AudioContext();if(context.state==='suspended')await context.resume();
    if(!useSound.getState().enabled||context.state!=='running'||generation!==soundGeneration)return;
    const audio=context,start=audio.currentTime;
    const voices={paper:[180,.10],glass:[1046,.22],metal:[330,.18],light:[740,.16],door:[262,.22],ink:[420,.08]} as const;
    const [pitch,duration]=voices[kind];
    const root=pitch*(.97+Math.random()*.06)*(pressed?.82:1);
    const gain=audio.createGain();gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(pressed?.023:.012,start+.009);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);gain.connect(output(audio));
    const oscillator=audio.createOscillator();track(oscillator);oscillator.type=kind==='glass'||kind==='light'?'sine':'triangle';oscillator.frequency.setValueAtTime(root,start);oscillator.frequency.exponentialRampToValueAtTime(root*(kind==='light'?1.22:.82),start+duration);oscillator.connect(gain);oscillator.start(start);oscillator.stop(start+duration);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    if(kind==='paper'||kind==='metal'){
      const buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*.065),audio.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);
      const noise=audio.createBufferSource(),filter=audio.createBiquadFilter(),level=audio.createGain();track(noise);noise.buffer=buffer;filter.type=kind==='paper'?'lowpass':'bandpass';filter.frequency.value=kind==='paper'?850:2400;level.gain.value=pressed?.025:.012;noise.connect(filter);filter.connect(level);level.connect(output(audio));noise.start();noise.onended=()=>{noise.disconnect();filter.disconnect();level.disconnect();};
    }
  }catch{/* Feedback never blocks the action. */}
}
