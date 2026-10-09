const {chromium}=require('../web/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:5174';
const PASS='regression private phrase';
const results=[];
(async()=>{
 const browser=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{});
 const dir=fs.mkdtempSync('/tmp/black-wall-edges-');console.log('Artifacts: '+dir);
 async function check(name,run){
  if(process.env.QA_CASES&&!process.env.QA_CASES.split(',').includes(name))return;
  const context=await browser.newContext({reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{await page.goto(base);await run(page,context);assert.deepEqual(errors,[]);results.push({name,status:'PASS'});}
  catch(e){results.push({name,status:'FAIL',error:e.message,console:errors});await page.screenshot({path:`${dir}/${name}.png`}).catch(()=>{});}
  finally{await context.close();fs.writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results.at(-1)));}
 }
 async function create(page){await page.getByLabel('Passphrase',{exact:true}).fill(PASS);await page.getByLabel('Repeat passphrase').fill(PASS);await page.getByRole('button',{name:'Create private archive'}).click();await page.getByLabel('What is on your mind?').waitFor();}
 async function note(page){await create(page);await page.getByLabel('What is on your mind?').fill('Secret regression note');await page.getByRole('button',{name:'Keep it',exact:true}).click();await page.getByRole('button',{name:'Keep this thought'}).click();await page.getByText('Saved encrypted on this device',{exact:true}).waitFor();}
 async function delay(page,method){await page.evaluate(method=>{const original=crypto.subtle[method].bind(crypto.subtle);crypto.subtle[method]=async(...args)=>{window.cryptoStarted=true;await new Promise(r=>setTimeout(r,1200));return original(...args)}},method);}
 async function hideViaHelp(page){await page.getByRole('button',{name:'Help & guide',exact:true}).click();await page.getByRole('dialog').getByRole('button',{name:'Hide screen',exact:true}).click();await page.getByRole('button',{name:'Return',exact:true}).click();}
 await check('hide-during-unlock',async page=>{
  await note(page);await page.getByRole('button',{name:'Hide screen',exact:true}).click();await page.getByRole('button',{name:'Return',exact:true}).click();await page.getByRole('button',{name:'Unlock archive',exact:true}).waitFor();
  await delay(page,'decrypt');await page.getByLabel('Passphrase',{exact:true}).fill(PASS);await page.getByRole('button',{name:'Unlock archive',exact:true}).click();await page.waitForFunction(()=>window.cryptoStarted);
  await hideViaHelp(page);await page.waitForTimeout(1800);assert.equal(await page.locator('.lobby,.diary-room').count(),0,'Hidden pending unlock must not reveal the archive after Return');
 });
 await check('hide-during-create',async page=>{
  await delay(page,'deriveKey');await page.getByLabel('Passphrase',{exact:true}).fill(PASS);await page.getByLabel('Repeat passphrase').fill(PASS);await page.getByRole('button',{name:'Create private archive'}).click();await page.waitForFunction(()=>window.cryptoStarted);
  await hideViaHelp(page);await page.waitForTimeout(1800);assert.equal(await page.locator('.lobby').count(),0,'Hidden pending creation must not reopen an unlocked archive');
 });
 await check('hide-during-restore',async page=>{
  await note(page);const envelope=await page.evaluate(async()=>(await import('/src/domain/storage.ts')).readEnvelope());await page.getByRole('button',{name:'Hide screen',exact:true}).click();await page.getByRole('button',{name:'Return',exact:true}).click();await page.getByRole('button',{name:'Unlock archive',exact:true}).waitFor();
  page.on('dialog',d=>d.accept());await page.getByLabel('Choose an encrypted backup').setInputFiles({name:'restore.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(envelope))});await delay(page,'decrypt');await page.getByLabel('Passphrase',{exact:true}).fill(PASS);await page.getByRole('button',{name:'Restore backup',exact:true}).click();await page.waitForFunction(()=>window.cryptoStarted);await hideViaHelp(page);await page.getByRole('button',{name:'Unlock archive',exact:true}).waitFor();assert.equal(await page.locator('.lobby,.diary-room').count(),0);
  await page.getByLabel('Passphrase',{exact:true}).fill(PASS);await page.getByRole('button',{name:'Unlock archive',exact:true}).click();await page.getByRole('link',{name:'Open My thoughts',exact:true}).waitFor();
 });
 await check('hide-during-start-fresh',async page=>{
  await create(page);await page.reload();await page.getByRole('button',{name:'Forgot passphrase?'}).click();const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Download old encrypted archive'}).click();await downloaded;await page.getByLabel('New passphrase',{exact:true}).fill('fresh archive phrase');await page.getByLabel('Repeat new passphrase').fill('fresh archive phrase');await page.getByLabel('Type START FRESH',{exact:false}).fill('START FRESH');await delay(page,'deriveKey');await page.getByRole('button',{name:'Replace with empty archive'}).click();await page.waitForFunction(()=>window.cryptoStarted);await hideViaHelp(page);await page.getByRole('button',{name:'Unlock archive',exact:true}).waitFor();assert.equal(await page.locator('.lobby').count(),0);await page.getByLabel('Passphrase',{exact:true}).fill('fresh archive phrase');await page.getByRole('button',{name:'Unlock archive',exact:true}).click();await page.locator('.lobby').waitFor();
 });
 await check('room-cap-round-trip',async page=>{
  await create(page);
  await page.evaluate(async()=>{const {useWall}=await import('/src/state/wall.ts');const {saveWorld,flushWorld}=await import('/src/domain/storage.ts');const rooms=Array.from({length:500},(_,i)=>({id:'r'+i,slug:'r'+i,name:'Room '+i,symbol:'',createdAt:1,updatedAt:1}));useWall.setState({rooms,stickies:[]});saveWorld({rooms,stickies:[]});await flushWorld()});
  await page.getByRole('link',{name:'Create a new room'}).click();await page.getByLabel('Room name',{exact:true}).fill('Room 501');await page.getByRole('button',{name:'Hang it up'}).click();await page.getByRole('alert').filter({hasText:'500-room limit'}).waitFor();assert.equal(await page.evaluate(async()=>(await import('/src/state/wall.ts')).useWall.getState().rooms.length),500);await page.getByText('Saved encrypted on this device',{exact:true}).waitFor();
  await page.reload();await page.getByLabel('Passphrase',{exact:true}).fill(PASS);await page.getByRole('button',{name:'Unlock archive',exact:true}).click();await page.waitForTimeout(500);assert.equal(await page.getByRole('alert').count(),0,'The app must not save an archive its own loader rejects');
 });
 await check('note-cap-validation',async page=>{
  await create(page);
  const result=await page.evaluate(async()=>{const {useWall}=await import('/src/state/wall.ts');const {validateWorld}=await import('/src/domain/storage.ts');const rooms=Array.from({length:51},(_,i)=>({id:'r'+i,slug:'r'+i,name:'Room '+i,symbol:'',createdAt:1,updatedAt:1}));const stickies=Array.from({length:10000},(_,i)=>({id:'n'+i,roomId:'r'+Math.floor(i/200),body:'note',createdAt:1,updatedAt:1,x:0,y:0,w:200,h:200,zIndex:1,color:'cream',rotation:0}));useWall.setState({rooms,stickies});const note=useWall.getState().addSticky('r50',{w:900,h:600});try{validateWorld(useWall.getState());return {accepted:!!note,valid:true}}catch{return {accepted:!!note,valid:false}}});
  assert.deepEqual(result,{accepted:false,valid:true},'Reject note 10,001 and preserve a valid archive');
 });
 await check('oversized-existing-archive-recovery',async page=>{
  await create(page);
  await page.evaluate(async()=>{const {useWall}=await import('/src/state/wall.ts');const {saveWorld,flushWorld}=await import('/src/domain/storage.ts');const rooms=Array.from({length:501},(_,i)=>({id:'r'+i,slug:'r'+i,name:'Room '+i,symbol:'',createdAt:1,updatedAt:1}));useWall.setState({rooms,stickies:[]});saveWorld({rooms,stickies:[]});await flushWorld()});
  await page.reload();await page.getByLabel('Passphrase',{exact:true}).fill(PASS);await page.getByRole('button',{name:'Unlock archive',exact:true}).click();await page.locator('.lobby').waitFor();
  const result=await page.evaluate(async()=>{const {useWall}=await import('/src/state/wall.ts');const store=useWall.getState();const count=store.rooms.length;const added=store.createRoom({name:'blocked',symbol:''});store.deleteRoom('r500');const {flushWorld}=await import('/src/domain/storage.ts');await flushWorld();return {count,added,remaining:useWall.getState().rooms.length}});assert.deepEqual(result,{count:501,added:null,remaining:500});
  await page.reload();await page.getByLabel('Passphrase',{exact:true}).fill(PASS);await page.getByRole('button',{name:'Unlock archive',exact:true}).click();await page.locator('.lobby').waitFor();
 });
 await check('hide-save-failure-recovery',async page=>{
  await note(page);await page.locator('.note-open').click();
  await page.evaluate(()=>{window.originalTransaction=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(stores,mode,...rest){if(mode==='readwrite')throw new DOMException('Storage full','QuotaExceededError');return window.originalTransaction.call(this,stores,mode,...rest)}});
  await page.getByLabel('Your thought').fill('RECOVER_AFTER_HIDE');await page.getByText('Not saved — retry or export',{exact:true}).waitFor();await page.locator('.note-editor').getByRole('button',{name:'Hide screen',exact:true}).click();await page.getByRole('button',{name:'Return',exact:true}).click();
  await page.getByRole('heading',{name:'Your notes are concealed'}).waitFor();assert.equal(await page.locator('.lobby,.diary-room,.note-editor').count(),0);assert.ok(!(await page.locator('body').innerText()).includes('RECOVER_AFTER_HIDE'));
  const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export encrypted backup',exact:true}).click();await download;
  await page.evaluate(()=>{IDBDatabase.prototype.transaction=window.originalTransaction});await page.getByRole('button',{name:'Retry saving and lock'}).click();await page.getByRole('button',{name:'Unlock archive',exact:true}).waitFor();await page.getByLabel('Passphrase',{exact:true}).fill(PASS);await page.getByRole('button',{name:'Unlock archive',exact:true}).click();await page.getByRole('link',{name:'Open My thoughts',exact:true}).click();await page.locator('.note-open').click();assert.equal(await page.getByLabel('Your thought').inputValue(),'RECOVER_AFTER_HIDE');
 });
 await check('shared-same-tab-replacement',async page=>{
  const payloads=await page.evaluate(async()=>{const {protect}=await import('/src/domain/privateContent.ts');return Promise.all(['first','second'].map(id=>protect({rooms:[{id,slug:id,name:id,createdAt:1,updatedAt:1}],stickies:[{id:'n'+id,roomId:id,body:id+' secret',createdAt:1,updatedAt:1}]},'shared test phrase')))});
  await page.goto(base+'/shared/');
  for(const payload of payloads){await page.evaluate(v=>location.hash=encodeURIComponent(JSON.stringify(v)),payload);await page.getByLabel('Share passphrase').fill('shared test phrase');await page.getByRole('button',{name:'Open',exact:true}).click();await page.getByRole('button',{name:/Open your letter/}).click();await page.locator('.shared-paper .rich-content').waitFor();}
  assert.equal(await page.getByText('first secret',{exact:true}).count(),0);assert.ok((await page.locator('.shared-paper .rich-content').textContent()).includes('second secret'));
 });
 await check('shared-hidden-new-link',async page=>{
  const payload=await page.evaluate(async()=>{const {protect}=await import('/src/domain/privateContent.ts');return protect({rooms:[{id:'r',slug:'r',name:'Room',createdAt:1,updatedAt:1}],stickies:[]},'shared test phrase')});
  await page.goto(base+'/shared/');await page.getByRole('button',{name:'Hide screen',exact:true}).click();await page.evaluate(v=>location.hash=encodeURIComponent(JSON.stringify(v)),payload);await page.getByLabel('Share passphrase').fill('shared test phrase');await page.getByRole('button',{name:'Open',exact:true}).click();await page.getByText('A little room to breathe',{exact:true}).waitFor();
 });
 await check('rename-escape',async page=>{
  await note(page);await page.getByRole('button',{name:'My thoughts',exact:true}).click();const field=page.getByLabel('Room name',{exact:true});await field.fill('Unwanted rename');await field.press('Escape');assert.equal(await page.getByRole('button',{name:'My thoughts',exact:true}).count(),1);
 });
 await check('unicode-and-duplicate-rooms',async page=>{
  await create(page);for(const name of ['月の部屋 🌙','月の部屋 🌙']){await page.getByRole('link',{name:'Create a new room'}).click();await page.getByLabel('Room name').fill(name);await page.getByRole('button',{name:'Hang it up'}).click();await page.getByRole('link',{name:'← Lobby'}).click();await page.locator('.lobby').waitFor();}
  const links=await page.getByRole('link',{name:'Open 月の部屋 🌙',exact:true}).evaluateAll(els=>els.map(e=>e.href));assert.equal(new Set(links).size,2);await page.reload();await page.getByLabel('Passphrase',{exact:true}).fill(PASS);await page.getByRole('button',{name:'Unlock archive'}).click();await page.getByRole('link',{name:'Open 月の部屋 🌙',exact:true}).first().waitFor();assert.equal(await page.getByRole('link',{name:'Open 月の部屋 🌙',exact:true}).count(),2);
 });
 await check('composer-empty-after-keep-choice',async page=>{
  await create(page);await page.getByLabel('What is on your mind?').fill('draft');await page.getByRole('button',{name:'Keep it',exact:true}).click();await page.getByLabel('What is on your mind?').fill('');await page.getByRole('button',{name:'Keep this thought'}).click();await page.waitForTimeout(250);assert.equal(await page.locator('.diary-note').count(),0,'Keep should not save a draft cleared after choosing a destination');
 });
 await check('hide-return-during-save',async page=>{
  await note(page);await page.locator('.note-open').click();await delay(page,'encrypt');await page.getByLabel('Your thought').fill('Private draft while save is pending');await page.waitForFunction(()=>window.cryptoStarted);
  await page.locator('.note-editor').getByRole('button',{name:'Hide screen',exact:true}).click();await page.getByRole('button',{name:'Return',exact:true}).click();
  assert.equal(await page.locator('.lobby,.diary-room').count(),0,'Return exposes an unlocked archive while the pending save is finishing');
 });
 await check('fairy-lights-keyboard-after-resize',async page=>{
  await create(page);await page.setViewportSize({width:1440,height:900});const group=page.locator('.lobby > .fairy-lights');await group.getByRole('button',{name:'Illuminate fairy light 2',exact:true}).focus();await page.setViewportSize({width:360,height:800});
  // Viewport resizing resolves before the browser necessarily delivers resize/ResizeObserver callbacks.
  await page.waitForFunction(()=>[...document.querySelectorAll('.lobby > .fairy-lights button')].filter(el=>el.tabIndex===0&&el.offsetParent!==null).length===1,undefined,{timeout:1000});
  const stops=await group.locator('button').evaluateAll(els=>els.filter(el=>el.tabIndex===0&&el.offsetParent!==null).length);assert.equal(stops,1,'Resizing hides the only tab stop in the fairy-light group');
 });
 await check('format-navigation-and-text-limit',async page=>{
  await note(page);await page.locator('.note-open').click();const field=page.getByLabel('Your thought');await field.fill('hello world');await field.evaluate(el=>el.setSelectionRange(0,5));await page.getByRole('button',{name:'Bold selected text'}).click();assert.equal(await field.inputValue(),'**hello** world');
  await field.fill('x'.repeat(10000));await page.getByRole('button',{name:'Bold selected text'}).click();await page.getByRole('alert').filter({hasText:'text limit'}).waitFor();assert.equal((await field.inputValue()).length,10000);
  await page.getByRole('button',{name:'Done',exact:true}).click();await page.getByRole('button',{name:'Pin a thought',exact:true}).click();await page.getByLabel('Your thought').fill('second note');await page.getByRole('button',{name:'Previous note',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#note-writing')?.value.length===10000);await page.getByRole('button',{name:'Next note',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#note-writing')?.value==='second note');
 });
 await check('mobile-short-viewport-and-long-content',async page=>{
  await page.setViewportSize({width:360,height:420});await note(page);await page.locator('.note-open').click();await page.getByLabel('Your thought').fill('longword'.repeat(800));await page.getByRole('button',{name:'Done',exact:true}).scrollIntoViewIfNeeded();
  assert.ok(await page.locator('.note-editor').evaluate(el=>el.scrollWidth<=el.clientWidth),'editor horizontal overflow');await page.getByRole('button',{name:'Done',exact:true}).click();await page.getByRole('link',{name:'← Lobby'}).click();await page.getByRole('button',{name:'Help & guide',exact:true}).click();await page.getByLabel('Find a feature or question').fill('no such topic zzz');await page.getByRole('button',{name:'Show all topics'}).click();await page.getByRole('button',{name:'Close help'}).click();
 });
 await check('note-keyboard-position-persists',async page=>{
  await note(page);const tape=page.getByRole('button',{name:'Move note. Use arrow keys to reposition.',exact:true});await tape.focus();await tape.press('ArrowRight');await tape.press('ArrowDown');await page.getByText('Saved encrypted on this device',{exact:true}).waitFor();
  const before=await page.locator('.diary-note').getAttribute('style');await page.reload();await page.getByLabel('Passphrase',{exact:true}).fill(PASS);await page.getByRole('button',{name:'Unlock archive'}).click();await page.locator('.diary-note').waitFor();assert.equal(await page.locator('.diary-note').getAttribute('style'),before);
 });
 await browser.close();console.log('Results: '+dir+'/results.json');process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exit(1)});
