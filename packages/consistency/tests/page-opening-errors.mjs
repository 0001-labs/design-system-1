import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {nativePageFixture} from './native-page-fixture.mjs';
const fixture=await nativePageFixture(),browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await fixture.route(page);
 await page.route('**/api/native-page?**',route=>route.fulfill({status:503,json:{error:'unavailable'}}));
 await page.goto(fixture.url,{waitUntil:'domcontentloaded'});
 const message=page.locator('consistency-site-editor ds-message');await message.waitFor();
 const centred=async element=>{const parent=await page.locator('consistency-site-editor').boundingBox(),box=await element.boundingBox();
  assert.ok(Math.abs(box.x+box.width/2-(parent.x+parent.width/2))<20,'Opening states must be horizontally centred');
  assert.ok(Math.abs(box.y+box.height/2-(parent.y+parent.height/2))<20,'Opening states must be vertically centred');};
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){await page.setViewportSize(viewport);await centred(message);}
 await page.route('**/sites/*/pages',route=>route.fulfill({json:{pages:[]}}));
 await page.reload({waitUntil:'domcontentloaded'});const empty=page.locator('consistency-site-editor ds-empty');await empty.waitFor();await centred(empty);
 console.log('Page-opening errors are centred in the content area.');
}finally{await browser.close();await fixture.close();}
