const {chromium}=require('../web/node_modules/playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:5186';
const results=[];
(async()=>{
 const browser=await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{});
 const dir=fs.mkdtempSync('/tmp/black-wall-security-');console.log('Artifacts: '+dir);
 async function test(name,fn){
  if(process.env.QA_CASES&&!process.env.QA_CASES.split(',').includes(name))return;
  const context=await browser.newContext({reducedMotion:'reduce'});const page=await context.newPage();page.setDefaultTimeout(15000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const start=Date.now();
  try{await page.goto(name==='recipient-corrupt-file-recovery-and-no-persistence'?base+'/shared/':base);const detail=await fn(page,context);assert.deepEqual(errors,[]);results.push({name,status:'PASS',detail,seconds:(Date.now()-start)/1000});}
  catch(e){results.push({name,status:'FAIL',error:e.message,errors,seconds:(Date.now()-start)/1000});await page.screenshot({path:`${dir}/${name}.png`,fullPage:true}).catch(()=>{});}
  finally{await context.close();fs.writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));console.log(JSON.stringify(results.at(-1)));}
 }
 async function create(page,pass='matrix archive phrase'){
  await page.getByLabel('Passphrase',{exact:true}).fill(pass);await page.getByLabel('Repeat passphrase').fill(pass);await page.getByRole('button',{name:'Create private archive'}).click();await page.getByLabel('What is on your mind?').waitFor();
 }
 async function save(page){await page.getByText('Saved encrypted on this device',{exact:true}).waitFor();await page.evaluate(async()=>{const {flushWorld}=await import('/src/domain/storage.ts');await flushWorld()});}
 await test('url-protocol-and-credentials-matrix',async page=>{
  const cases=[['https://example.com',true],['http://example.com/path?q=ok#here',true],['https://例え.テスト/道',true],['HTTPS://EXAMPLE.COM',true],[' https://example.com ',true],['https://example.com/@hello',true],['javascript:alert(1)',false],['JaVaScRiPt:alert(1)',false],['java\nscript:alert(1)',false],['data:text/html,<script>alert(1)</script>',false],['file:///etc/passwd',false],['vbscript:msgbox(1)',false],['blob:https://example.com/id',false],['ftp://example.com',false],['//example.com',false],['/relative',false],['https://user:password@example.com',false],['https://user@example.com',false],['mailto:hello@example.com',false],['',false],['https://',false],['javascript%3Aalert(1)',false],['\u0000javascript:alert(1)',false]];
  const actual=await page.evaluate(async cases=>{const {safeLink}=await import('/src/domain/presentation.ts');return cases.map(([url])=>!!safeLink(url))},cases);
  assert.deepEqual(actual,cases.map(c=>c[1]));return {inputs:cases.length};
 });
 await test('authenticated-encryption-tamper-and-phrase-matrix',async page=>{
  const detail=await page.evaluate(async()=>{
   const {protect,unprotect}=await import('/src/domain/privateContent.ts');const phrases=['abcdefghijkl',' spaces stay here ','月明かりの秘密の手紙です🌙','a'.repeat(200)];let roundTrips=0,rejections=0;const failures=[];
   for(const pass of phrases){const content={message:'Sensitive sentinel α👩🏽‍💻\n<script>not executable</script>'};const a=await protect(content,pass),b=await protect(content,pass);if(a.iv===b.iv||a.salt===b.salt||a.data===b.data)failures.push('reused randomness');if(JSON.stringify(await unprotect(a,pass))!==JSON.stringify(content))failures.push('roundtrip');roundTrips++;
    const flip=v=>{const bytes=Uint8Array.from(atob(v),c=>c.charCodeAt(0));bytes[0]^=1;return btoa(String.fromCharCode(...bytes))};
    for(const bad of [{...a,data:flip(a.data)},{...a,iv:flip(a.iv)},{...a,salt:flip(a.salt)},{...a,data:a.data.slice(4)},{...a,data:'not base64!'}]){try{await unprotect(bad,pass);failures.push('tamper accepted')}catch{rejections++}}
    for(const wrong of [pass+'x',pass.toUpperCase()===pass?pass+'wrong':pass.toUpperCase()]){try{await unprotect(a,wrong);failures.push('wrong phrase accepted')}catch{rejections++}}
   }
   for(const pass of ['', 'x'.repeat(11),'x'.repeat(201)]){try{await protect({},pass);failures.push('invalid phrase length accepted')}catch{rejections++}}
   return {roundTrips,rejections,failures};
  });assert.deepEqual(detail.failures,[]);return detail;
 });
 await test('malformed-world-fuzz-and-prototype-inputs',async page=>{
  const detail=await page.evaluate(async()=>{
   const {validateWorld}=await import('/src/domain/storage.ts');const valid={rooms:[{id:'r',slug:'r',name:'Room',createdAt:1,updatedAt:1}],stickies:[{id:'n',roomId:'r',body:'safe',createdAt:1,updatedAt:1}]};const cases=[null,[],{},1,'text',{rooms:[],stickies:[valid.stickies[0]]}];
   const vals=[null,{},[],true,42];for(const value of vals){for(const field of ['id','slug','name']){const w=structuredClone(valid);w.rooms[0][field]=value;cases.push(w)}for(const field of ['id','roomId','body']){const w=structuredClone(valid);w.stickies[0][field]=value;cases.push(w)}}
   for(const slug of ['../secret','x/y','a?b','<script>','']){const w=structuredClone(valid);w.rooms[0].slug=slug;cases.push(w)}
   for(let i=0;i<100;i++){const w=structuredClone(valid);if(i%2)w.stickies[0].roomId='missing'+i;else w.rooms.push({...w.rooms[0]});cases.push(w)}
   for(const body of ['x'.repeat(10001),null,{},[]]){const w=structuredClone(valid);w.stickies[0].body=body;cases.push(w)}
   let rejected=0;const accepted=[];cases.forEach((value,i)=>{try{validateWorld(value);accepted.push(i)}catch{rejected++}});
   const polluted=JSON.parse('{"rooms":[],"stickies":[],"__proto__":{"polluted":"yes"},"constructor":{"prototype":{"polluted":"yes"}}}');const clean=validateWorld(polluted);
   return {inputs:cases.length,rejected,accepted,prototypePolluted:({}).polluted??null,keys:Object.keys(clean)};
  });assert.deepEqual(detail.accepted,[]);assert.equal(detail.prototypePolluted,null);assert.deepEqual(detail.keys,['rooms','stickies']);return detail;
 });
 await test('xss-through-room-note-and-recipient',async page=>{
  const payloads=['<img src=x onerror="window.__xss=1">','<svg onload="window.__xss=1"></svg>','<script>window.__xss=1</script>','[click](javascript:window.__xss=1)','[click](data:text/html,evil)','**<iframe srcdoc="<script>parent.__xss=1</script>"></iframe>**','</textarea><img src=x onerror="window.__xss=1">','[credential](https://user:pass@example.com)','[safe](https://example.com)'];
  const envelope=await page.evaluate(async payloads=>{const {protect}=await import('/src/domain/privateContent.ts');return protect({rooms:[{id:'r',slug:'r',name:'<img src=x onerror="window.__xss=1">',createdAt:1,updatedAt:1}],stickies:payloads.map((body,i)=>({id:'n'+i,roomId:'r',body,createdAt:1,updatedAt:1}))},'security shared phrase')},payloads);
  await page.goto(base+'/shared/#'+encodeURIComponent(JSON.stringify(envelope)));await page.getByLabel('Share passphrase').fill('security shared phrase');await page.getByRole('button',{name:'Open',exact:true}).click();await page.getByRole('button',{name:/Open your letter/}).click();await page.locator('.shared-paper--main .rich-content').waitFor();
  assert.equal(await page.evaluate(()=>window.__xss??null),null);assert.equal(await page.locator('.shared-notes script,.shared-notes iframe,.rich-content img,.rich-content svg').count(),0);
  const links=await page.locator('.rich-content a').evaluateAll(els=>els.map(el=>({href:el.href,rel:el.rel,target:el.target})));assert.ok(links.length>=1);for(const link of links){const u=new URL(link.href);assert.ok(['https:','http:'].includes(u.protocol));assert.equal(u.username,'');assert.equal(u.password,'');assert.ok(link.rel.includes('noopener')&&link.rel.includes('noreferrer'));assert.equal(link.target,'_blank')}
  const before=page.context().pages().length;page.once('dialog',d=>d.dismiss());await page.getByRole('link',{name:'safe',exact:true}).click();assert.equal(page.context().pages().length,before);
  return {payloads:payloads.length,safeLinks:links.length};
 });
 await test('plaintext-storage-and-request-leakage',async(page,context)=>{
  const secret='PRIVATE_SENTINEL_47a09_not_for_network';const pass='PHRASE_SENTINEL_63bc7';const requests=[];const messages=[];
  page.on('request',r=>requests.push({url:r.url(),body:r.postData()||''}));page.on('console',m=>messages.push(m.text()));await create(page,pass);await page.getByLabel('What is on your mind?').fill(secret);await page.getByRole('button',{name:'Keep it',exact:true}).click();await page.getByRole('button',{name:'Keep this thought'}).click();await save(page);
  const persisted=await page.evaluate(async()=>{const {readEnvelope}=await import('/src/domain/storage.ts');return {local:{...localStorage},session:{...sessionStorage},cookies:document.cookie,envelope:await readEnvelope()}});
  const serialized=JSON.stringify(persisted);for(const marker of [secret,pass])assert.ok(!serialized.includes(marker));assert.ok(persisted.envelope.ciphertext);
  await page.getByRole('button',{name:'Share room',exact:true}).click();const dialog=page.getByRole('dialog',{name:'Share privately'});await dialog.getByLabel('Share passphrase',{exact:true}).fill('Separate sharing phrase');await dialog.getByLabel('Repeat passphrase').fill('Separate sharing phrase');await dialog.getByRole('button',{name:'Prepare private share'}).click();const link=await dialog.getByLabel('Protected share link').inputValue();assert.ok(!link.includes(secret)&&!link.includes(pass));
  for(const marker of [secret,pass]){assert.ok(!JSON.stringify(requests).includes(marker));assert.ok(!JSON.stringify(messages).includes(marker))}
  return {capturedRequests:requests.length,externalOrigins:[...new Set(requests.map(r=>new URL(r.url).origin).filter(o=>o!==new URL(base).origin))],storageContainsCiphertext:true,plaintextFound:false};
 });
 await test('invalid-media-upload-matrix',async page=>{
  const detail=await page.evaluate(async()=>{const {readAttachment}=await import('/src/domain/media.ts');const cases=[['evil.svg','image/svg+xml','<svg onload="alert(1)"/>'],['bad.png','image/png','not a png'],['bad.jpg','image/jpeg','<script>alert(1)</script>'],['empty.wav','audio/wav',''],['page.html','text/html','<img src=x onerror=alert(1)>'],['bad.mp3','audio/mpeg','garbage'],['bad.webm','video/webm','garbage'],['zero.png','image/png','']];const accepted=[];for(const [name,type,text]of cases){try{await readAttachment(new File([text],name,{type}));accepted.push(name)}catch{}}return {inputs:cases.length,accepted}});assert.deepEqual(detail.accepted,[]);return detail;
 });
 await test('recipient-corrupt-file-recovery-and-no-persistence',async page=>{
  const envelope=await page.evaluate(async()=>{const {protect}=await import('/src/domain/privateContent.ts');return protect({rooms:[{id:'r',slug:'r',name:'Room',createdAt:1,updatedAt:1}],stickies:[{id:'n',roomId:'r',body:'RECIPIENT_ONLY_SENTINEL',createdAt:1,updatedAt:1}]},'recipient private phrase')});
  await page.goto(base+'/shared/');for(const content of ['{broken','[]','{}','{"format":"black-wall-private-content","version":99}']){await page.getByLabel('Open shared file').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from(content)});await page.getByRole('alert').waitFor();assert.equal(await page.getByRole('button',{name:'Open',exact:true}).isDisabled(),true)}
  await page.getByLabel('Open shared file').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(envelope))});await page.getByLabel('Share passphrase').fill('wrong');await page.getByRole('button',{name:'Open',exact:true}).click();await page.getByRole('alert').waitFor();assert.equal(await page.locator('.shared-paper').count(),0);await page.getByLabel('Share passphrase').fill('recipient private phrase');await page.getByRole('button',{name:'Open',exact:true}).click();await page.getByRole('button',{name:/Open your letter/}).click();await page.locator('.rich-content').waitFor();
  const storage=await page.evaluate(async()=>({local:{...localStorage},session:{...sessionStorage},dbs:await indexedDB.databases()}));assert.ok(!JSON.stringify(storage).includes('RECIPIENT_ONLY_SENTINEL'));assert.equal(storage.dbs.length,0);
  await page.getByRole('button',{name:'Close the room',exact:true}).click();assert.equal(await page.locator('.rich-content').count(),0);await page.reload();assert.equal(await page.getByRole('button',{name:'Open',exact:true}).isDisabled(),true);return {invalidFiles:4,recipientDatabases:storage.dbs.length};
 });
 const profiles=[{pass:'abcdefghijkl',name:'A room',width:1440},{pass:'月明かりの秘密の手紙です🌙',name:'月の部屋 🌙',width:768},{pass:'a'.repeat(200),name:'غرفتي الخاصة',width:390},{pass:' spaced phrase stays ',name:'<b>private & quiet</b>',width:360}];
 for(const [i,profile]of profiles.entries())await test('user-input-journey-'+(i+1),async page=>{
  await page.setViewportSize({width:profile.width,height:900});await create(page,profile.pass);await page.getByRole('link',{name:'Create a new room'}).click();await page.getByLabel('Room name').fill(profile.name);await page.getByRole('button',{name:'Hang it up'}).click();await page.getByRole('button',{name:'Pin a thought',exact:true}).click();
  const inputs=['ordinary text','line one\n\nline three','  keep my spaces  ','**bold** and *italic*','日本語 العربية தமிழ் 👩🏽‍💻','e\u0301 café 🌙','<script>window.__xss=1</script>','x'.repeat(10000)];
  for(const input of inputs){const field=page.getByLabel('Your thought');await field.fill(input);await save(page);assert.equal(await field.inputValue(),input);assert.equal(await page.evaluate(()=>window.__xss??null),null)}
  await page.getByRole('button',{name:'Done',exact:true}).click();await page.reload();await page.getByLabel('Passphrase',{exact:true}).fill(profile.pass);await page.getByRole('button',{name:'Unlock archive',exact:true}).click();await page.locator('.note-open').click();assert.equal((await page.getByLabel('Your thought').inputValue()).length,10000);
  await page.getByLabel('Your thought').fill('saved after reload');await page.getByRole('button',{name:'Done',exact:true}).click();await page.getByRole('button',{name:'Let this note go',exact:true}).click();await page.getByRole('button',{name:'Keep it',exact:true}).click();assert.equal(await page.locator('.diary-note').count(),1);await page.getByRole('button',{name:'Let this note go',exact:true}).click();await page.getByRole('button',{name:'Let it go',exact:true}).click();await page.locator('.diary-note').waitFor({state:'detached'});await save(page);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));return {inputs:inputs.length,width:profile.width,passphraseLength:profile.pass.length};
 });
 await test('rapid-edits-last-write-wins',async page=>{
  await create(page);await page.getByLabel('What is on your mind?').fill('first');await page.getByRole('button',{name:'Keep it',exact:true}).click();await page.getByRole('button',{name:'Keep this thought'}).click();await page.locator('.note-open').click();const field=page.getByLabel('Your thought');await field.fill('');const start=Date.now();const body='abcdefghijklmnopqrstuvwxyz'.repeat(4);await field.pressSequentially(body);await save(page);const ms=Date.now()-start;await page.reload();await page.getByLabel('Passphrase',{exact:true}).fill('matrix archive phrase');await page.getByRole('button',{name:'Unlock archive'}).click();await page.locator('.note-open').click();assert.equal(await page.getByLabel('Your thought').inputValue(),body);return {typedCharacters:body.length,typingAndSaveMs:ms};
 });
 await browser.close();console.log('Results: '+dir+'/results.json');process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
})().catch(e=>{console.error(e);process.exit(1)});
