import { MEDIA_TYPES } from './storage';
import type { Attachment } from './types';
export async function readAttachment(file: File): Promise<Attachment> {
  if (!MEDIA_TYPES.includes(file.type as Attachment['type'])) throw new Error('Choose a JPEG, PNG or WebP photo, MP3/WAV/Ogg/WebM audio, or MP4/WebM video.');
  const audio = file.type.startsWith('audio/');
  const photo = file.type.startsWith('image/');
  if(!file.size)throw new Error('This file is empty. Choose another file.');
  if(photo) await new Promise<void>((resolve,reject)=>{
    const image=new Image();const url=URL.createObjectURL(file);
    const cleanup=()=>{clearTimeout(timer);image.onload=null;image.onerror=null;URL.revokeObjectURL(url);};
    const timer=setTimeout(()=>{cleanup();image.src='';reject(new Error('Could not read this photo.'));},60000);
    image.onload=()=>{const pixels=image.naturalWidth*image.naturalHeight;cleanup();if(!pixels)reject(new Error('This photo could not be read.'));else resolve();};
    image.onerror=()=>{cleanup();reject(new Error('This photo cannot be opened. Try JPEG, PNG or WebP.'));};image.src=url;
  });
  const duration = photo ? 0 : await new Promise<number>((resolve, reject) => {
    const media = document.createElement(audio ? 'audio' : 'video'); const url = URL.createObjectURL(file);
    const cleanup = () => { clearTimeout(timer); media.removeAttribute('src'); media.load(); URL.revokeObjectURL(url); };
    const timer = setTimeout(() => { cleanup(); reject(new Error('Could not read this media file. Try another format.')); }, 60000);
    media.preload = 'metadata'; media.onloadedmetadata = () => { const duration = media.duration; cleanup(); resolve(Number.isFinite(duration) && duration >= 0 ? duration : 0); };
    media.onerror = () => { cleanup(); reject(new Error('This file cannot be played in your browser.')); }; media.src = url;
  });
  const data = await new Promise<string>((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read the file.')); reader.readAsDataURL(file); });
  return { id: crypto.randomUUID(), name: file.name.slice(0,180), type: file.type as Attachment['type'], bytes: file.size, duration, data };
}
