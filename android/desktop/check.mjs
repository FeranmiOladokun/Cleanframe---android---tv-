import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:4798/');const tv=page.frameLocator('#tv');
 await tv.locator('#desktopVideo').waitFor();
 await page.waitForFunction(()=>{const w=document.querySelector('#tv').contentWindow;return w.ShoreQA&&w.ShoreQA.ready()&&w.document.querySelector('#desktopVideo').readyState>=2;});
 await page.waitForFunction(()=>document.querySelector('#tv').contentDocument.querySelector('#cleanWeather').textContent.includes('Today'));
 const dimensions=await page.locator('#screen').evaluate(e=>{const r=e.getBoundingClientRect();return{ratio:r.width/r.height,width:r.width,height:r.height};});assert.ok(Math.abs(dimensions.ratio-16/9)<.001);
 const settings=await tv.locator('body').evaluate(()=>({look:ShoreQA.state().committed,dock:CleanFrameDock.state(),video:{width:desktopVideo.videoWidth,height:desktopVideo.videoHeight,time:desktopVideo.currentTime}}));
 assert.equal(settings.look.apps,'icons');assert.equal(settings.dock.size,80);assert.equal(settings.dock.glass,'liquid');assert.equal(settings.video.width,3840);
 await tv.getByRole('button',{name:'Quick controls',exact:true}).click();
 await tv.locator('.quick-card').waitFor();await page.waitForTimeout(450);
 const ratios=await tv.locator('body').evaluate(()=>{const s=document.querySelector('#stage').getBoundingClientRect(),q=document.querySelector('.quick-card').getBoundingClientRect(),d=document.querySelector('#dock').getBoundingClientRect();return{island:q.width/s.width,dock:d.width/s.width,center:(q.left+q.width/2-s.left)/s.width};});
 assert.ok(Math.abs(ratios.island-1120/1920)<.001);assert.ok(Math.abs(ratios.center-.5)<.001);assert.ok(Math.abs(ratios.dock-944*.8/1920)<.002);
 await page.screenshot({path:'android/out/desktop-preview-1440.png'});
 await page.setViewportSize({width:1920,height:1080});await page.locator('#hide').click();
 const clean=await page.locator('#screen').boundingBox();assert.equal(clean.width,1920);assert.equal(clean.height,1080);
 await tv.locator('#stage').press('Escape');await tv.locator('.quick-overlay').waitFor({state:'hidden'});
 await tv.getByRole('button',{name:'Settings',exact:true}).click();await tv.locator('[data-action="settings.group.layout"]').click();await tv.locator('[data-action="layout.dock"]').click();
 assert.equal(await tv.locator('.dock-editor').isVisible(),true);await page.screenshot({path:'android/out/desktop-dock-1080.png'});
 const range=await page.request.get('http://localhost:4798/media/waves.mp4',{headers:{Range:'bytes=0-63'}});assert.equal(range.status(),206);assert.equal((await range.body()).length,64);
 for(const path of ['/.git/config','/tv/../../../android/shortcut-key.jks','/android/shortcut-key.jks'])assert.equal((await page.request.get('http://localhost:4798'+path)).status(),404);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({dimensions,ratios,video:settings.video,result:'16:9 scaling, TV proportions, live 4K playback, current controls, dock settings, seeking and private-file protection passed'}));
} finally {await browser.close();}
