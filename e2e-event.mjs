import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';

// Test the built application with the shipped CSP and real detector models.
// Only the camera input and speech output are simulated; sample inference is real.
const root = resolve('dist-detector');
const artifactDir = process.env.LENS_QA_DIR || join(tmpdir(), `word-lens-event-qa-${Date.now()}`);
await mkdir(artifactDir, { recursive: true });
const mime = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.wasm':'application/wasm', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.txt':'text/plain' };
const csp = (await readFile('public/_headers','utf8')).split('\n').find(line=>line.includes('Content-Security-Policy:')).split('Content-Security-Policy: ')[1].trim();
const server = createServer(async(req,res)=>{
 try {
  const pathname = new URL(req.url,'http://local').pathname;
  const path = resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(!path.startsWith(root+'/')&&!path.startsWith(root+'\\'))throw Error('path');
  const bytes = await readFile(path);
  res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream','Content-Security-Policy':csp});res.end(bytes);
 } catch { res.writeHead(404);res.end('Not found'); }
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base = (process.env.LENS_TEST_URL || `http://127.0.0.1:${server.address().port}`).replace(/\/$/, '');
const browser = await chromium.launch({headless:true,channel:process.env.LENS_BROWSER_CHANNEL||'chrome'});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[],requests=[];
page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>requests.push(request.url()));
await page.addInitScript(()=>{
 window.cameraCalls=0;window.testSpeech=[];window.testStreams=[];window.cameraDenied=false;
 if(!navigator.mediaDevices)Object.defineProperty(navigator,'mediaDevices',{value:{}});
 window.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 const voices=[{name:'English',lang:'en-US',localService:true},{name:'Spanish',lang:'es-MX',localService:true}];
 Object.defineProperty(window,'speechSynthesis',{value:{getVoices:()=>voices,addEventListener:()=>{},cancel:()=>{},speak:u=>{testSpeech.push({text:u.text,lang:u.lang});setTimeout(()=>u.onend?.(),10);}}});
 navigator.mediaDevices.getUserMedia=async()=>{
  cameraCalls++;
  if(cameraDenied)throw new DOMException('Denied','NotAllowedError');
  const image=new Image();image.src='/samples/chair.jpg';await image.decode();
  const canvas=document.createElement('canvas');canvas.width=480;canvas.height=640;
  canvas.getContext('2d').drawImage(image,0,0,480,640);
  const stream=canvas.captureStream(15);testStreams.push(stream);return stream;
 };
});
let report;
try {
 await page.goto(base);await page.locator('#language option').last().waitFor({state:'attached'});
 assert.equal(await page.locator('html').getAttribute('lang'),'en');
 assert.equal(await page.locator('#language').inputValue(),'es');
 assert.equal(await page.evaluate(()=>cameraCalls),0);
 await page.screenshot({path:join(artifactDir,'desktop-ready.png'),fullPage:true});
 const firstScan=Date.now();await page.locator('#sample').click();
 const expanded=page.locator('#object-choices button[data-label="Chair"]');
 await expanded.first().waitFor({timeout:120000});
 const firstScanMs=Date.now()-firstScan;
 assert.equal(await page.evaluate(()=>cameraCalls),0,'Sample must not request a camera');
 assert.equal(await page.locator('#word').innerText(),'—','Selection must be explicit');
 await expanded.first().click();assert.equal(await page.locator('#word').innerText(),'silla');
 assert.equal(await page.locator('#japanese').innerText(),'English: chair');
 await page.locator('#speak').click();await page.waitForFunction(()=>testSpeech.length===1);
 assert.deepEqual(await page.evaluate(()=>testSpeech[0]),{text:'silla',lang:'es-MX'});
 await page.locator('#language').selectOption('ja');assert.equal(await page.locator('#word').innerText(),'椅子');
 assert.ok(await page.locator('#speak').isDisabled(),'No Japanese voice: no wrong-language fallback');
 assert.ok(await page.locator('#voice-availability').isVisible());
 await page.locator('#language').selectOption('en');assert.equal(await page.locator('#word').innerText(),'chair');
 const layouts=[];
 for(const width of [375,390,768,1440]){
  await page.setViewportSize({width,height:900});
  const layout=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,minTap:Math.min(...[...document.querySelectorAll('button,select,summary,a')].filter(el=>el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden').map(el=>el.getBoundingClientRect().height))}));
  layouts.push(layout);assert.ok(!layout.overflow&&layout.minTap>=44,JSON.stringify(layout));
  if(width===375||width===1440)await page.screenshot({path:join(artifactDir,`sample-${width}.png`),fullPage:true});
 }
 await page.locator('.speech-settings summary').click();
 await page.locator('#detector').selectOption('standard');
 const standard=page.locator('#object-choices button[data-label="chair"]');
 await standard.first().waitFor({timeout:90000});await standard.first().click();
 assert.equal(await page.locator('#word').innerText(),'chair');
 await page.locator('#clear-selection').click();assert.equal(await page.locator('#word').innerText(),'—');
 await page.locator('#stop').click();assert.ok(await page.locator('#sample-image').isHidden());
 // A rejected camera permission must still leave a working sample path.
 await page.evaluate(()=>{cameraDenied=true;});await page.locator('#start').click();
 await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Camera access was denied'));
 await page.locator('#sample').click();await standard.first().waitFor({timeout:90000});
 await page.locator('#stop').click();await page.evaluate(()=>{cameraDenied=false;});
 await page.locator('#start').click();await standard.first().waitFor({timeout:90000});
 await page.waitForFunction(()=>/scan [2-9]/.test(document.getElementById('camera-status').textContent));
 await standard.first().click();assert.equal(await page.locator('#word').innerText(),'chair');
 await page.locator('#sample').click();await standard.first().waitFor({timeout:90000});
 assert.ok(await page.evaluate(()=>testStreams.every(s=>s.getTracks().every(track=>track.readyState==='ended'))));
 await page.locator('#stop').click();
 // Real asset failure, recovery, and cancellation while the model is loading.
 await page.locator('#detector').selectOption('expanded');
 const modelUrl=requests.find(url=>url.endsWith('/expanded/openimages-int8-weights.onnx'));assert.ok(modelUrl);
 await page.route(modelUrl,route=>route.fulfill({status:503,body:'test'}));
 await page.locator('#sample').click();await page.waitForFunction(()=>document.getElementById('status').textContent.includes('Could not scan the sample'));
 await page.unroute(modelUrl);await page.locator('#sample').click();await expanded.first().waitFor({timeout:90000});await page.locator('#stop').click();
 await page.reload();await page.locator('#language option').last().waitFor({state:'attached'});
 assert.equal(await page.locator('#language').inputValue(),'en');
 await page.route(modelUrl,async route=>{await new Promise(r=>setTimeout(r,500));await route.continue().catch(()=>{});});
 await page.locator('#sample').click();await page.locator('#stop').click();
 await page.waitForTimeout(800);assert.ok(await page.locator('#sample-image').isHidden());assert.equal(await page.locator('.object-box').count(),0);
 await page.unroute(modelUrl);
 for(const path of ['/samples/chair.jpg','/samples/ATTRIBUTION.txt','/THIRD_PARTY.txt','/og.png','/icon.svg'])assert.equal(await page.evaluate(async path=>(await fetch(path,{cache:'no-store'})).status,path),200,path);
 for(const path of ['/.env','/.git/config','/package.json','/README.md','/app.mjs','/fixtures/chair-clear.jpg','/unknown-test-path'])assert.equal(await page.evaluate(async path=>(await fetch(path,{cache:'no-store'})).status,path),404,path);
 assert.equal(await page.locator('.maker').getAttribute('href'),'https://aclabtech.com/en/');
 const noJs=await browser.newPage({javaScriptEnabled:false,viewport:{width:375,height:900}});
 await noJs.goto(base);assert.ok((await noJs.locator('noscript').innerText()).includes('Enable JavaScript'));await noJs.close();
 const external=requests.filter(url=>!url.startsWith(base)&&!url.startsWith('data:'));
 assert.equal(external.length,0,JSON.stringify(external));assert.equal(errors.length,0,JSON.stringify(errors));
 report={pass:true,firstScanMs,layouts,pageErrors:errors,externalRequests:external.length,artifactDir,camera:'simulated image stream',speech:'mock API; physical listening not tested'};
 console.log(JSON.stringify(report));
} catch(error){
 console.error(JSON.stringify({error:String(error),status:await page.locator('#status').textContent().catch(()=>''),pageErrors:errors,artifactDir}));process.exitCode=1;
} finally {await browser.close();await new Promise(r=>server.close(r));}
