import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {nativePageFixture} from './native-page-fixture.mjs';
const fixture=await nativePageFixture();
try{for(const engine of [chromium,webkit]){
 const browser=await engine.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});await fixture.route(page);
  let styles=0,untrusted=0;
  await page.route('https://designsystem1.com/ds1/base/latest.css',route=>{styles++;return route.fulfill({contentType:'text/css',body:'body{--trusted-base-loaded:1}'});});
  await page.route('https://untrusted.invalid/**',route=>{untrusted++;return route.fulfill({contentType:'text/css',body:'body{color:red}'});});
  await page.route('**/api/native-page?**',async route=>{
   const snapshot=await fixture.read('/');
   const canvas=(await fixture.html('/',true)).replace('</head>','<link rel="stylesheet" href="https://designsystem1.com/ds1/base/latest.css"></head>').replace('</body>','<script>window.siteScriptRan=true</script></body>');
   await route.fulfill({json:{...snapshot,canvas}});
  });
  await page.addInitScript(()=>{document.addEventListener('page-ready',()=>window.pageReady=true);document.addEventListener('page-error',()=>window.pageFailed=true);});
  await page.goto(fixture.url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>window.pageReady||window.pageFailed,{},{timeout:18000});
  assert.equal(await page.evaluate(()=>!!window.pageFailed),false,'The trusted base stylesheet must not prevent opening');
  assert.equal(styles,1);
  const frame=page.frameLocator('.consistency-site-frame');
  assert.equal(await frame.locator('body').evaluate(body=>body.ownerDocument.defaultView.siteScriptRan),undefined,'Site scripts must remain blocked');
  await frame.locator('body').evaluate(body=>{const link=body.ownerDocument.createElement('link');link.rel='stylesheet';link.href='https://untrusted.invalid/style.css';body.append(link);});
  await page.waitForTimeout(100);assert.equal(untrusted,0,'Untrusted external styles must remain blocked');
  console.log(`${engine.name()}: trusted DS1 base loads; page opens; site scripts and untrusted styles stay blocked.`);
 }finally{await browser.close();}
}}finally{await fixture.close();}
