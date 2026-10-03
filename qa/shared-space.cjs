const {chromium}=require('../web/node_modules/playwright');
const assert=require('node:assert/strict');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:5173';
const executablePath=process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;
const phrase='a little secret phrase';
(async()=>{
 const browser=await chromium.launch(executablePath?{executablePath}:{});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(base+'/shared');
  const envelope=await page.evaluate(async()=>{
   const {protect}=await import('/src/domain/privateContent.ts');
   const canvas=document.createElement('canvas');canvas.width=480;canvas.height=320;const ctx=canvas.getContext('2d');ctx.fillStyle='#455c66';ctx.fillRect(0,0,480,320);ctx.fillStyle='#f6e9cf';ctx.beginPath();ctx.arc(320,100,42,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2a3e46';ctx.fillRect(0,220,480,100);
   const png=canvas.toDataURL();
   const wav=new Uint8Array(16044);const d=new DataView(wav.buffer);const str=(s,p)=>[...s].forEach((c,i)=>wav[p+i]=c.charCodeAt(0));str('RIFF',0);d.setUint32(4,16036,true);str('WAVEfmt ',8);d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,8000,true);d.setUint32(28,16000,true);d.setUint16(32,2,true);d.setUint16(34,16,true);str('data',36);d.setUint32(40,16000,true);
   const audio='data:audio/wav;base64,'+btoa(String.fromCharCode(...wav));
   const stream=canvas.captureStream(10);const recorder=new MediaRecorder(stream,{mimeType:'video/webm'});const chunks=[];const finished=new Promise(resolve=>recorder.onstop=resolve);recorder.ondataavailable=e=>chunks.push(e.data);recorder.start();await new Promise(r=>setTimeout(r,250));ctx.fillRect(0,220,480,100);recorder.stop();await finished;stream.getTracks().forEach(t=>t.stop());const video=await new Promise(resolve=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}))});
   return protect({rooms:[{id:'one',slug:'one',name:'Little things I love',createdAt:1,updatedAt:1},{id:'two',slug:'two',name:'For your rainy days',createdAt:1,updatedAt:1},{id:'empty',slug:'empty',name:'A quiet corner',createdAt:1,updatedAt:1}],stickies:[{id:'n1',roomId:'one',body:'Some days, the smallest things are the loveliest. Like hearing from you.\n\nI saved this little corner, just for you.',color:'cream',rotation:-2,createdAt:1,updatedAt:1},{id:'n2',roomId:'one',body:'Remember this evening?',color:'rose',rotation:2,createdAt:1,updatedAt:1,attachments:[{id:'photo',name:'Moon over the water',type:'image/png',data:png,duration:0}]},{id:'n3',roomId:'two',body:'There is always a little light waiting for you here.\n[Our song](https://example.com/song)',color:'sage',createdAt:1,updatedAt:1,attachments:[{id:'voice',name:'A small hello.wav',type:'audio/wav',data:audio,duration:1},{id:'film',name:'A moment by the water.webm',type:'video/webm',data:video,duration:.25}]}]},'a little secret phrase');
  });
  const openLink=async()=>{await page.goto('about:blank');await page.goto(base+'/shared/#'+encodeURIComponent(JSON.stringify(envelope)))};
  const unlock=async()=>{await page.getByLabel('Share passphrase').fill(phrase);await page.getByRole('button',{name:'Open',exact:true}).click();await page.locator('.shared-room-heading').waitFor()};
  const snap=async(name)=>{await page.screenshot({path:`/tmp/${name}.png`,fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page overflow');assert.ok(await page.locator('.secret-room').evaluate(e=>e.scrollWidth<=e.clientWidth),'scene overflow')};
  await openLink();await page.evaluate(()=>document.fonts.ready);
  for(const width of [1440,768,360]){await page.setViewportSize({width,height:900});await snap(`shared-entry-${width}`)}
  await page.getByLabel('Share passphrase').fill('wrong phrase');await page.getByRole('button',{name:'Open',exact:true}).click();await page.getByRole('alert').waitFor();assert.equal(await page.getByLabel('Share passphrase').inputValue(),'');assert.equal(await page.getByLabel('Share passphrase').getAttribute('placeholder'),'not quite… try again');await snap('shared-wrong-360');
  await page.getByLabel('Share passphrase').fill(phrase);await page.getByLabel('Share passphrase').press('Enter');await page.locator('.is-opening').waitFor();assert.equal(await page.locator('.shared-room-heading').count(),0);await page.locator('.shared-room-heading').waitFor();assert.equal(await page.evaluate(()=>document.activeElement.tagName),'H1');
  assert.equal(new URL(page.url()).hash,'');assert.equal(await page.locator('textarea').count(),0);assert.equal(await page.locator('.shared-paper').count(),2);
  await page.setViewportSize({width:1440,height:1000});await snap('shared-sealed-1440');
  await page.getByRole('button',{name:/Open your letter/}).click();await page.locator('.shared-paper--main .rich-content').waitFor();await page.waitForTimeout(1800);await page.locator('.shared-media img').evaluate(img=>img.decode());
  for(const width of [1440,768,360]){await page.setViewportSize({width,height:1000});await snap(`shared-room-${width}`)}
  await page.waitForTimeout(1600);assert.equal(await page.locator('.shared-celebration').count(),0);
  await page.getByRole('button',{name:'Fold the letter'}).click();await page.getByRole('button',{name:/Open your letter/}).click();assert.equal(await page.locator('.is-revealing').count(),0);
  console.log('PASS: entry, wrong/right phrase, reveal, desktop/tablet/mobile layout');
  // Three real OFF/ON cycles; no reload or app remount, bounded nodes and new serial IDs.
  for(let i=0;i<3;i++){
   await page.getByRole('button',{name:'Falling letters on',exact:true}).click();assert.equal(await page.locator('.falling-letters>span').count(),0);
   await page.getByRole('button',{name:'Falling letters off',exact:true}).click();await page.locator('.falling-letters>span').first().waitFor();
   const before=await page.locator('.falling-letters>span').last().getAttribute('data-letter-id');await page.waitForTimeout(1000);assert.notEqual(await page.locator('.falling-letters>span').last().getAttribute('data-letter-id'),before);assert.ok(await page.locator('.falling-letters>span').count()<=8);
  }
  // Simulate Page Visibility API changes deterministically (headless tabs do not hide).
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});assert.equal(await page.locator('.falling-letters>span').count(),0);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))});await page.locator('.falling-letters>span').first().waitFor();
  await page.getByRole('button',{name:'Turn room light off'}).click();assert.equal(await page.locator('html').getAttribute('data-cursor'),'match');await page.getByRole('button',{name:'Turn room light on'}).click();
  await page.getByRole('button',{name:'For your rainy days'}).click();await page.getByRole('button',{name:/Open your letter/}).click();await page.waitForTimeout(1600);await page.waitForFunction(()=>document.querySelector('audio')?.readyState>=1);assert.equal(await page.locator('video').count(),1);assert.equal(await page.locator('.shared-media--audio').count(),1);await snap('shared-media-360');
  page.once('dialog',d=>d.dismiss());await page.getByRole('link',{name:'Our song'}).click();
  await page.getByRole('button',{name:'A quiet corner',exact:true}).click();await page.getByText('A little room to breathe',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Close the room',exact:true}).click();await page.getByLabel('Share passphrase').waitFor();assert.equal(await page.getByLabel('Share passphrase').inputValue(),'');assert.equal(await page.locator('.shared-paper').count(),0);await unlock();await page.locator('.shared-paper--main .rich-content').waitFor();
  const reply=await browser.newPage();await reply.goto(base+new URL(await page.getByRole('link',{name:'Leave one back ♡'}).getAttribute('href'),base).pathname+'?reply=1#first-thought');await reply.getByLabel('Passphrase',{exact:true}).fill('reply archive phrase');await reply.getByLabel('Repeat passphrase').fill('reply archive phrase');await reply.getByRole('button',{name:'Create private archive'}).click();await reply.getByLabel('What is on your mind?').waitFor();await reply.waitForFunction(()=>document.activeElement?.id==='first-thought');await reply.close();
  await page.getByRole('button',{name:'Hide screen',exact:true}).click();assert.equal(await page.locator('.shared-paper').count(),0);await page.getByRole('button',{name:'Return',exact:true}).click();await page.getByLabel('Share passphrase').waitFor();
  await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.wick-body').evaluate(e=>getComputedStyle(e).animationName),'none');await page.waitForFunction(()=>document.querySelectorAll('.falling-letters>span').length===0);await unlock();assert.equal(await page.locator('.shared-celebration').count(),0);
  await page.reload();await page.getByLabel('Share passphrase').waitFor();assert.equal(await page.locator('.shared-paper').count(),0);assert.equal(await page.getByRole('button',{name:'Open',exact:true}).isDisabled(),true);
  await page.getByLabel('Open shared file').setInputFiles({name:'letter.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(envelope))});await page.getByText('Your letter is ready.',{exact:true}).waitFor();await unlock();await page.getByRole('button',{name:/Open your letter/}).click();assert.equal(await page.locator('.shared-ink').first().evaluate(e=>getComputedStyle(e).opacity),'1');await page.getByRole('button',{name:'Close the room',exact:true}).click();
  console.log('PASS: ambient lifecycle, media, close/reopen, refresh and reduced motion');
  // Hide during decrypt, and during success transition, cannot expose stale plaintext.
  await page.evaluate(()=>{const decrypt=crypto.subtle.decrypt.bind(crypto.subtle);crypto.subtle.decrypt=async(...args)=>{await new Promise(resolve=>setTimeout(resolve,400));return decrypt(...args)}});
  await page.getByLabel('Share passphrase').fill(phrase);await page.getByRole('button',{name:'Open',exact:true}).click();await page.getByRole('button',{name:'Hide screen',exact:true}).click();await page.getByRole('button',{name:'Return',exact:true}).click();await page.waitForTimeout(900);assert.equal(await page.locator('.shared-paper').count(),0);
  await page.emulateMedia({reducedMotion:'no-preference'});await page.getByLabel('Share passphrase').fill(phrase);await page.getByRole('button',{name:'Open',exact:true}).click();await page.locator('.is-opening').waitFor();await page.keyboard.press('Escape');await page.getByRole('button',{name:'Return',exact:true}).click();await page.waitForTimeout(1000);assert.equal(await page.locator('.shared-paper').count(),0);
  // Existing local room regression: enabling restores measured piled letters.
  await page.goto(base);await page.getByLabel('Passphrase',{exact:true}).fill('local archive phrase');await page.getByLabel('Repeat passphrase').fill('local archive phrase');await page.getByRole('button',{name:'Create private archive'}).click();
  await page.getByLabel('What is on your mind?').fill('These letters should fall again.');await page.getByRole('button',{name:'Keep it',exact:true}).click();await page.getByRole('button',{name:'Keep this thought'}).click();
  for(let i=0;i<3;i++){
   await page.getByRole('button',{name:'Falling letters on',exact:true}).click();assert.equal(await page.locator('.diary-note').getAttribute('data-piled'),'false');
   await page.getByRole('button',{name:'Falling letters off',exact:true}).click();assert.equal(await page.locator('.diary-note').getAttribute('data-piled'),'true');
  }
  await page.waitForTimeout(900);assert.ok(await page.locator('.diary-note .pile-letter').evaluateAll(els=>els.every(el=>getComputedStyle(el).transform!=='none'&&el.style.getPropertyValue('--pile-y')!=='')));
  await page.locator('.note-open').click();await page.getByRole('button',{name:'Done',exact:true}).click();await page.locator('.note-editor').waitFor({state:'detached'});assert.equal(await page.locator('.diary-note').getAttribute('data-piled'),'true');
  await page.getByRole('button',{name:'Turn room light off'}).click();await page.mouse.move(0,0);assert.equal(await page.locator('.diary-note').getAttribute('data-piled'),'true');
  await page.getByRole('button',{name:'Falling letters on',exact:true}).click();await page.waitForTimeout(700);await page.reload();await page.getByLabel('Passphrase',{exact:true}).fill('local archive phrase');await page.getByRole('button',{name:'Unlock archive',exact:true}).click();await page.getByRole('button',{name:'Falling letters off',exact:true}).waitFor();
  assert.deepEqual(errors,[]);console.log('PASS: link/file, wrong/right phrase, Enter, transition cancellation, envelope/reopen, multi-room, image/audio/video/link, close/relock, refresh privacy, desktop/tablet/360, reduced motion, light, three ambient/local falling-letter cycles, visibility, persistence, console clean.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
