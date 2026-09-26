import { useWall } from '../state/wall';
import { flushWorld, saveWorld, validateWorld, type World } from './storage';
import { protect, unprotect } from './privateContent';
export type Scope={kind:'note'|'room';id:string};
export function mediaBytes(world:World){return world.rooms.reduce((n,r)=>n+(r.locked?.mediaBytes??0),0)+world.stickies.reduce((n,s)=>n+(s.locked?.mediaBytes??0)+(s.attachments??[]).reduce((sum,a)=>sum+a.bytes,0),0);}
export async function changeItemLock(scope:Scope,pass:string,onChanged?:()=>void){
  await flushWorld();const state=useWall.getState();
  const snapshot=JSON.stringify({rooms:state.rooms,stickies:state.stickies});
  const room=state.rooms.find(r=>scope.kind==='room'?r.id===scope.id:state.stickies.find(n=>n.id===scope.id)?.roomId===r.id);
  const note=state.stickies.find(n=>n.id===scope.id);
  const item=scope.kind==='room'?room:note;
  if(!room||!item)throw new Error('This item is no longer available.');
  let next:World;
  if(item.locked){
    const recovered=validateWorld(await unprotect(item.locked,pass));
    if(recovered.rooms.length!==1||recovered.rooms[0].id!==room.id||recovered.rooms[0].locked||recovered.stickies.some(n=>n.roomId!==room.id))throw new Error('This lock does not belong to this room.');
    if(scope.kind==='note'&&(recovered.stickies.length!==1||recovered.stickies[0].id!==item.id||recovered.stickies[0].locked))throw new Error('This lock does not belong to this note.');
    next=scope.kind==='room'?{rooms:state.rooms.map(r=>r.id===room.id?recovered.rooms[0]:r),stickies:[...state.stickies.filter(n=>n.roomId!==room.id),...recovered.stickies]}:{rooms:state.rooms,stickies:state.stickies.map(n=>n.id===item.id?recovered.stickies[0]:n)};
  }else{
    const content:World={rooms:[room],stickies:state.stickies.filter(n=>scope.kind==='room'?n.roomId===room.id:n.id===scope.id)};
    const locked=await protect(content,pass,mediaBytes(content));
    next=scope.kind==='room'?{rooms:state.rooms.map(r=>r.id===room.id?{...r,name:'Locked room',symbol:'♡',locked}:r),stickies:state.stickies.filter(n=>n.roomId!==room.id)}:{rooms:state.rooms,stickies:state.stickies.map(n=>n.id===item.id?{...n,body:'',attachments:[],locked}:n)};
  }
  if(snapshot!==JSON.stringify({rooms:useWall.getState().rooms,stickies:useWall.getState().stickies}))throw new Error('The archive changed while securing this item. Please try again.');
  next=validateWorld(next);onChanged?.();useWall.setState(next);saveWorld(next);await flushWorld();
}
/** A temporary view never replaces the encrypted item in the store or on disk. */
export async function previewLockedItem(scope:Scope,pass:string):Promise<World>{
  const state=useWall.getState();
  const item=scope.kind==='room'?state.rooms.find(r=>r.id===scope.id):state.stickies.find(n=>n.id===scope.id);
  const envelope=item?.locked;if(!envelope)throw new Error('This item is no longer locked.');
  const roomId=scope.kind==='room'?scope.id:state.stickies.find(n=>n.id===scope.id)?.roomId;
  const world=validateWorld(await unprotect(envelope,pass));
  const current=scope.kind==='room'?useWall.getState().rooms.find(r=>r.id===scope.id):useWall.getState().stickies.find(n=>n.id===scope.id);
  if(current?.locked!==envelope)throw new Error('This item changed. Open it again.');
  if(world.rooms.length!==1||world.rooms[0].id!==roomId||world.rooms[0].locked||world.stickies.some(n=>n.roomId!==roomId)||scope.kind==='note'&&(world.stickies.length!==1||world.stickies[0].id!==scope.id||world.stickies[0].locked))throw new Error('This lock does not belong to this item.');
  return world;
}
export function shareSelection(scope:Scope|{kind:'space'}):{world:World;excluded:number}{
  const state=useWall.getState();const chosenRooms=state.rooms.filter(r=>scope.kind==='space'||(scope.kind==='room'?r.id===scope.id:state.stickies.find(n=>n.id===scope.id)?.roomId===r.id));
  const rooms=chosenRooms.filter(r=>!r.locked);const ids=new Set(rooms.map(r=>r.id));
  const chosenNotes=state.stickies.filter(n=>ids.has(n.roomId)&&(scope.kind!=='note'||n.id===scope.id));
  return {world:validateWorld({rooms:rooms.map(r=>scope.kind==='note'?{...r,name:'Shared note',slug:'shared-note',symbol:'✧'}:r),stickies:chosenNotes.filter(n=>!n.locked)}),excluded:chosenRooms.filter(r=>r.locked).length+chosenNotes.filter(n=>n.locked).length};
}
