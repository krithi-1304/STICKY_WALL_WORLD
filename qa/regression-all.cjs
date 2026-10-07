// Run current suites with isolated browser storage and bounded concurrency.
const { chromium } = require('../web/node_modules/playwright');
if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE) {
  const launch = chromium.launch.bind(chromium);
  chromium.launch = options => launch({ ...options, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE });
}
if (require.main === module) {
  const { spawn } = require('node:child_process');
  const fs = require('node:fs');
  const path = require('node:path');
  const suites = process.env.QA_SUITES ? process.env.QA_SUITES.split(',') : ['private-archive','privacy-failures','passphrase-recovery','media-sharing-locks','large-media','physical-interactions','ui-polish','help-guide','sound-state','room-motion','room-controls','shared-space','public-share'];
  const dir = fs.mkdtempSync('/tmp/black-wall-regression-');
  const results = [];
  console.log(`Artifacts: ${dir}`);
  async function worker() {
    while (suites.length) {
      const suite = suites.shift(); const start = Date.now();
      const output = fs.openSync(path.join(dir, `${suite}.log`), 'w');
      const result = await new Promise(resolve => {
        const child = spawn(process.execPath, ['--require', __filename, path.join(__dirname, `${suite}.cjs`)], { env: process.env, stdio: ['ignore',output,output] });
        const timer = setTimeout(() => child.kill('SIGTERM'), 240000);
        child.on('error', error => { clearTimeout(timer); resolve({code:null,error:error.message}); });
        child.on('exit', (code,signal) => { clearTimeout(timer); resolve({code,signal}); });
      });
      fs.closeSync(output);
      results.push({suite,...result,seconds:Math.round((Date.now()-start)/1000)});
      fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify(results,null,2));
      console.log(`${result.code===0?'PASS':'FAIL'} ${suite} (${results.at(-1).seconds}s)`);
    }
  }
  Promise.all(Array.from({length:Number(process.env.QA_WORKERS||1)},()=>worker())).then(() => { console.log(`Results: ${dir}/results.json`); process.exitCode=results.some(r=>r.code!==0)?1:0; });
}
