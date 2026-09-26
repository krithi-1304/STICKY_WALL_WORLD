export interface PrivateContent { format: 'black-wall-private-content'; version: 1; salt: string; iv: string; data: string; mediaBytes: number }
const encoder=new TextEncoder();
function base64(bytes:Uint8Array){let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text);}
function bytes(text:string):Uint8Array<ArrayBuffer>{return Uint8Array.from(atob(text),c=>c.charCodeAt(0));}
export function parsePrivate(value:unknown):PrivateContent{
  if(!value||typeof value!=='object')throw new Error('Invalid protected content.');
  const v=value as PrivateContent;
  if(v.format!=='black-wall-private-content'||v.version!==1||typeof v.salt!=='string'||typeof v.iv!=='string'||typeof v.data!=='string'||!Number.isFinite(v.mediaBytes)||v.mediaBytes<0||bytes(v.salt).length!==16||bytes(v.iv).length!==12)throw new Error('Invalid protected content.');
  return {format:v.format,version:1,salt:v.salt,iv:v.iv,data:v.data,mediaBytes:v.mediaBytes};
}
async function key(pass:string,salt:string){const material=await crypto.subtle.importKey('raw',encoder.encode(pass),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(salt),iterations:310000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);}
export async function protect(value:unknown,pass:string,mediaBytes=0):Promise<PrivateContent>{
  if(pass.length<12||pass.length>200)throw new Error('Choose a passphrase between 12 and 200 characters.');
  const salt=base64(crypto.getRandomValues(new Uint8Array(16))),iv=crypto.getRandomValues(new Uint8Array(12));
  const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode('black-wall:private-content:1')},await key(pass,salt),encoder.encode(JSON.stringify(value)));
  return {format:'black-wall-private-content',version:1,salt,iv:base64(iv),data:base64(new Uint8Array(encrypted)),mediaBytes};
}
export async function unprotect(value:PrivateContent,pass:string):Promise<unknown>{
  const v=parsePrivate(value);let plain:ArrayBuffer;
  try{plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(v.iv),additionalData:encoder.encode('black-wall:private-content:1')},await key(pass,v.salt),bytes(v.data));}catch{throw new Error('Incorrect passphrase, or the protected content is damaged.');}
  return JSON.parse(new TextDecoder().decode(plain));
}
export function downloadPrivate(value:PrivateContent){const url=URL.createObjectURL(new Blob([JSON.stringify(value)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='black-wall-shared.encrypted.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
