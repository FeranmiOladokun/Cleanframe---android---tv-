import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try{
const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://localhost:4798/');const tv=page.frameLocator('#tv');await tv.locator('.music-banner').waitFor();
const evaluate=fn=>tv.locator('body').evaluate(fn);
await evaluate(()=>{window.testMedia={access:true,active:true,playing:true,title:'First song',artist:'First artist',duration:240000,position:60000};AndroidFrame.quickState=()=>JSON.stringify(testMedia);CleanFrameMusic.refresh();});
assert.equal(await tv.locator('.music-title').textContent(),'First song');assert.equal(await tv.locator('.music-elapsed').textContent(),'1:00');assert.equal(await tv.locator('.music-duration').textContent(),'4:00');
assert.equal(await tv.locator('.music-banner').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
await evaluate(()=>{testMedia.playing=false;CleanFrameMusic.refresh();});assert.equal(await tv.locator('.music-banner').isVisible(),false);
await evaluate(()=>{testMedia.playing=true;testMedia.title='Next song';testMedia.artist='Next artist';testMedia.position=1000;testMedia.duration=180000;CleanFrameMusic.refresh();});assert.equal(await tv.locator('.music-title').textContent(),'Next song');assert.equal(await tv.locator('.music-duration').textContent(),'3:00');
await evaluate(()=>{delete testMedia.duration;CleanFrameMusic.refresh();});assert.equal(await tv.locator('.music-timeline').isVisible(),false);
await evaluate(()=>{testMedia.duration=180000;CleanFrameMusic.refresh();});
await tv.getByRole('button',{name:'Settings',exact:true}).click();await tv.locator('[data-action="settings.group.layout"]').click();
const order=await tv.locator('[data-action="layout.dock"],[data-action="layout.spotify"]').evaluateAll(es=>es.map(e=>e.getAttribute('data-action')));assert.deepEqual(order,['layout.dock','layout.spotify']);
await tv.locator('[data-action="layout.spotify"]').click();await tv.locator('.music-editor').waitFor();
await tv.locator('#stage').press('ArrowDown');await tv.locator('#stage').press('Enter');assert.equal(await evaluate(()=>CleanFrameMusic.state()),'center');
await tv.locator('[data-action="layout.spotify"]').click();await tv.locator('#stage').press('ArrowDown');await tv.locator('#stage').press('Escape');assert.equal(await evaluate(()=>CleanFrameMusic.state()),'center');
await tv.locator('[data-action="layout.spotify"]').click();await tv.locator('[data-music-choice="weather"]').click();assert.equal(await evaluate(()=>CleanFrameMusic.state()),'weather');
await page.reload();await tv.locator('#stage').waitFor();assert.equal(await evaluate(()=>CleanFrameMusic.state()),'weather');
await evaluate(()=>{ShoreQA.scene('home');CleanFrameMusic.refresh();});await tv.locator('.music-banner').waitFor();
await page.screenshot({path:'android/out/spotify-installed-preview.png'});
await tv.getByRole('button',{name:'Settings',exact:true}).click();await tv.locator('[data-action="settings.group.layout"]').click();await page.screenshot({path:'android/out/spotify-layout-settings.png'});await tv.locator('[data-action="layout.spotify"]').click();await page.screenshot({path:'android/out/spotify-placement-settings.png'});
await tv.locator('[data-music-choice="off"]').click();assert.equal(await evaluate(()=>CleanFrameMusic.state()),'off');
await evaluate(()=>{ShoreQA.scene('home');CleanFrameMusic.refresh();});assert.equal(await tv.locator('.music-banner').isVisible(),false);
await evaluate(()=>{CleanFrameMusic.preview('left');AndroidFrame.quickState=()=>JSON.stringify({access:false});CleanFrameMusic.refresh();});assert.equal(await tv.locator('.music-banner').isVisible(),false);
assert.deepEqual(errors,[]);console.log('Spotify metadata, progress, pause, absent timing/access, floating surface, Layout order, D-pad save/cancel, persistence and Off passed.');
}finally{await browser.close();}
