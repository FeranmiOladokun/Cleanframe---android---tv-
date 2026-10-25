import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true});
try {
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.goto('http://localhost:4798/');
const frame=page.frameLocator('#tv');
await frame.locator('.music-study').waitFor();
await page.waitForFunction(()=>document.querySelector('#tv').contentDocument.querySelector('#desktopVideo').readyState>=2);
for(const position of ['left','center','weather']){
 await page.locator('[data-music="'+position+'"]').click();
 await page.waitForTimeout(450);
 const box=await frame.locator('.music-study').boundingBox();assert.ok(box.width>300&&box.width<400);
 await page.screenshot({path:'android/out/spotify-placement-'+position+'.png'});
}
await page.locator('[data-music="off"]').click();await frame.locator('.music-study').waitFor({state:'hidden'});
console.log('All three glass placement previews and Off passed.');
}finally{await browser.close();}
