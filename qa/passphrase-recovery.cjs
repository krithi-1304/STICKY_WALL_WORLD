const {chromium}=require('../web/node_modules/playwright');
const assert=require('node:assert/strict');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:5173';
(async()=>{const browser=await chromium.launch();try{
 const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage();
 await page.goto(base);
 const result=await page.evaluate(async()=>{
  const s=await import('/src/domain/storage.ts');
  const world={rooms:[{id:'r',slug:'r',name:'Kept room',symbol:'*',createdAt:1,updatedAt:1}],stickies:[]};
  await s.createVault('original passphrase',world);
  const before=await s.readEnvelope();
  const transaction=IDBDatabase.prototype.transaction;
  IDBDatabase.prototype.transaction=function(stores,mode,...rest){if(mode==='readwrite')throw Error('quota');return transaction.call(this,stores,mode,...rest)};
  let failed=false;try{await s.changePassphrase('failed passphrase',()=>world)}catch{failed=true}
  IDBDatabase.prototype.transaction=transaction;
  const unchanged=JSON.stringify(before)===JSON.stringify(await s.readEnvelope());
  let current=world;
  const changing=s.changePassphrase('replacement passphrase',()=>current);
  current={...world,rooms:[{...world.rooms[0],name:'Latest room'}]};s.saveWorld(current);
  await changing;await s.flushWorld();await s.forgetKey();
  let oldRejected=false;try{await s.openVault('original passphrase')}catch{oldRejected=true}
  const opened=await s.openVault('replacement passphrase');await s.forgetKey();
  return {failed,unchanged,oldRejected,name:opened.rooms[0].name};
 });assert.deepEqual(result,{failed:true,unchanged:true,oldRejected:true,name:'Latest room'});
 await page.reload();await page.getByLabel('Passphrase',{exact:true}).fill('replacement passphrase');await page.getByRole('button',{name:'Unlock archive'}).click();
 await page.getByRole('button',{name:'Change passphrase',exact:true}).click();
 await page.getByLabel('New passphrase',{exact:true}).fill('my new private phrase');await page.getByLabel('Repeat new passphrase').fill('does not match');await page.getByRole('button',{name:'Save new passphrase'}).click();await page.getByRole('alert').filter({hasText:'do not match'}).waitFor();
 await page.getByLabel('Repeat new passphrase').fill('my new private phrase');await page.getByRole('button',{name:'Save new passphrase'}).click();await page.getByText('Your notes are kept',{exact:true}).waitFor();await page.getByRole('button',{name:'Done',exact:true}).click();await page.reload();
 await page.getByRole('button',{name:'Forgot passphrase?'}).click();
 assert.equal(await page.getByRole('button',{name:'Replace with empty archive'}).count(),0);
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Download old encrypted archive'}).click();const file=await download;await file.saveAs('/tmp/recovery-old.encrypted.json');
 await page.getByLabel('New passphrase',{exact:true}).fill('fresh archive phrase');await page.getByLabel('Repeat new passphrase').fill('fresh archive phrase');
 assert.equal(await page.getByRole('button',{name:'Replace with empty archive'}).isDisabled(),true);
 await page.getByLabel('Type START FRESH',{exact:false}).fill('START FRESH');
 const second=await context.newPage();await second.goto(base);await second.getByLabel('Passphrase',{exact:true}).fill('my new private phrase');await second.getByRole('button',{name:'Unlock archive'}).click();await second.getByRole('link',{name:'Open Latest room'}).waitFor();
 await page.getByRole('button',{name:'Replace with empty archive'}).click();await page.getByRole('alert').filter({hasText:'another tab'}).waitFor();await second.close();
 await page.setViewportSize({width:320,height:740});await page.locator('.vault-page').evaluate(e=>e.scrollTop=0);assert.ok((await page.getByRole('heading',{name:'Forgot your passphrase?'}).boundingBox()).y>=0);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'/tmp/recovery-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Replace with empty archive'}).click();await page.getByLabel('What is on your mind?').waitFor();assert.equal(await page.getByRole('link',{name:'Open Latest room'}).count(),0);
 await page.reload();await page.getByLabel('Passphrase',{exact:true}).fill('fresh archive phrase');await page.getByRole('button',{name:'Unlock archive'}).click();await page.getByLabel('What is on your mind?').waitFor();
 await page.getByRole('button',{name:'Hide screen',exact:true}).click();await page.getByRole('button',{name:'Return',exact:true}).click();await page.getByRole('button',{name:'Unlock archive',exact:true}).waitFor();
 page.on('dialog',dialog=>dialog.accept());await page.locator('input[type=file]').setInputFiles('/tmp/recovery-old.encrypted.json');await page.getByLabel('Passphrase',{exact:true}).fill('my new private phrase');await page.getByRole('button',{name:'Restore backup',exact:true}).click();await page.getByRole('link',{name:'Open Latest room',exact:true}).waitFor();
 console.log('PASS: failed rotation preserves archive; queued edits kept; old passphrase rejected; form mismatch; confirmed reset; concurrent tab blocked; fresh unlock; old backup restores.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
