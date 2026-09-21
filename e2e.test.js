/* Playwright E2E suite for Dakshinamurthy.
 * Run: npm run test:e2e   (first time: npm run test:e2e:install)
 *
 * WHY THIS FILE WAS REWRITTEN
 * ---------------------------
 * The previous version asserted a ten-button rail (today, myday, log, revise,
 * progress, study, plan, ai, settings, help) that had not existed since v13.
 * It failed on its second check and timed out on its third, so nobody ran it,
 * and it was never wired into `npm test`. While it sat broken, 15.0.2 shipped
 * with the More tab dead and six screens unreachable — a defect that ONLY a
 * rendering test can see, because every string it needed was present in the
 * bundle and all nine source-level suites passed.
 *
 * The rule this file now enforces: every route must actually paint, every
 * route must be reachable by tapping, and no interaction may raise a browser
 * error. Source greps cannot establish any of that.
 */
const path = require('path');
const http = require('http');
const fs = require('fs');
let chromium;
try { chromium = require('playwright').chromium; }
catch (e) {
  console.error('E2E BLOCKED: Playwright is not installed. Run `npm run test:e2e:install`.');
  process.exit(2);
}
const ROOT = path.join(__dirname, '..');
const PORT = 8917;
const MIME = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
function startServer(){return new Promise(resolve=>{const s=http.createServer((req,res)=>{let p=(req.url||'/').split('?')[0]; if(p==='/')p='/index.html'; const full=path.join(ROOT,p); fs.readFile(full,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':MIME[path.extname(full)]||'application/octet-stream'});res.end(data);});});s.listen(PORT,()=>resolve(s));});}

const RAIL = ['today','revise','progress','more'];
const SUBSCREENS = ['study','log','plan','settings','help','ai'];

let failures=0;
function check(label,cond){ if(cond) console.log('  OK   '+label); else { console.log('  FAIL '+label); failures++; } }
async function fresh(browser){ return browser.newContext({viewport:{width:390,height:844}}); }
function watch(page){ const issues=[]; page.on('pageerror',e=>issues.push('[pageerror] '+e.message.split('\n')[0])); page.on('console',m=>{if(m.type()==='error')issues.push('[console] '+m.text().split('\n')[0].slice(0,200));}); return issues; }
const first = async page => (await page.locator('#app').innerText()).split('\n').map(s=>s.trim()).filter(Boolean)[0]||'';

(async()=>{
 const server=await startServer(); const browser=await chromium.launch();
 try {
  // 1. Boot, rail shape, and every route paints without a browser error.
  {const ctx=await fresh(browser);const page=await ctx.newPage();const issues=watch(page);
   await page.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'networkidle'});await page.waitForTimeout(300);
   check('app launches',await page.locator('#app').count()===1);
   const tabs=await page.locator('.railbtn').evaluateAll(bs=>bs.map(b=>b.dataset.tab));
   check('rail is exactly Today / Practice / Progress / More',JSON.stringify(tabs)===JSON.stringify(RAIL));
   check('Viva is absent from navigation',!tabs.includes('viva'));
   check('Mocks are absent from navigation',!tabs.includes('mocks'));
   check('the dead myday route is rejected',await page.evaluate(()=>window.SMNAV('myday'))===false);
   for(const t of RAIL.concat(SUBSCREENS)){
     const ok=await page.evaluate(x=>window.SMNAV(x),t);
     await page.waitForTimeout(140);
     const text=await page.locator('#app').innerText();
     check(`${t} routes and paints`, ok===true && text.trim().length>50);
   }
   check('no browser errors while visiting every route',issues.length===0);
   if(issues.length)console.log('       '+[...new Set(issues)].join('\n       '));
   await ctx.close();}

  // 2. More is reachable by TAP and lists every sub-screen. This is the exact
  //    defect 15.0.2 shipped: SMNAV('more') threw, the catch reverted the tab,
  //    and the tap looked like it did nothing at all.
  {const ctx=await fresh(browser);const page=await ctx.newPage();const issues=watch(page);
   await page.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'networkidle'});await page.waitForTimeout(300);
   await page.locator('.railbtn[data-tab="more"]').click();await page.waitForTimeout(200);
   check('tapping More actually opens More',/more/i.test(await first(page)));
   const routes=await page.locator('#app [data-go-tab]').evaluateAll(bs=>bs.map(b=>b.getAttribute('data-go-tab')));
   for(const s of SUBSCREENS) check(`More offers ${s}`,routes.includes(s));
   check('opening More raises no error',issues.length===0);
   await ctx.close();}

  // 3. Every sub-screen opens from More and gets back, by tapping only.
  {const ctx=await fresh(browser);const page=await ctx.newPage();const issues=watch(page);
   await page.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'networkidle'});await page.waitForTimeout(300);
   for(const s of SUBSCREENS){
     await page.locator('.railbtn[data-tab="more"]').click();await page.waitForTimeout(160);
     await page.locator(`#app [data-go-tab="${s}"]`).click();await page.waitForTimeout(180);
     const landed=await first(page);
     const back=page.locator('#app .dm24-subnav .dm24-back');
     check(`${s} opens from More (${landed})`,landed.length>0 && await back.count()===1);
     /* The back bar must be tappable where it renders, not merely present:
        the first build of it was a <nav>, which unscoped `nav{position:fixed}`
        rules pinned to the bottom of the screen under the tab bar. */
     await back.click({timeout:4000});await page.waitForTimeout(180);
     check(`${s} returns to More`,/more/i.test(await first(page)));
   }
   check('sub-screen round trips raise no errors',issues.length===0);
   if(issues.length)console.log('       '+[...new Set(issues)].join('\n       '));
   await ctx.close();}

  // 4. Today's primary call to action must change the screen. "Start this"
  //    carried data-nav="myday", which set tab="today" and repainted the
  //    identical page — a dead button in the most important position.
  {const ctx=await fresh(browser);const page=await ctx.newPage();const issues=watch(page);
   await page.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'networkidle'});await page.waitForTimeout(300);
   const start=page.locator('#app [data-start-block]');
   check('Today offers a Start/Resume action',await start.count()>=1);
   if(await start.count()){
     const before=await page.evaluate(()=>document.querySelectorAll('#app .chev.up').length);
     await start.first().click();await page.waitForTimeout(500);
     const after=await page.evaluate(()=>document.querySelectorAll('#app .chev.up').length);
     check('Start opens the block it names',after>before);
   }
   check('Start raises no errors',issues.length===0);
   await ctx.close();}

  // 5. Every control on every screen, clicked once. Nothing may throw.
  {const ctx=await fresh(browser);const page=await ctx.newPage();const issues=watch(page);
   await ctx.grantPermissions(['clipboard-read','clipboard-write']).catch(()=>{});
   await page.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'networkidle'});await page.waitForTimeout(300);
   let clicked=0;
   for(const t of RAIL.concat(SUBSCREENS)){
     await page.evaluate(x=>window.SMNAV(x),t);await page.waitForTimeout(160);
     const n=await page.evaluate(()=>document.querySelectorAll('#app button, #app summary').length);
     for(let i=0;i<n;i++){
       await page.evaluate(j=>{const b=document.querySelectorAll('#app button, #app summary')[j]; if(b)b.click();},i);
       await page.waitForTimeout(45); clicked++;
       await page.evaluate(x=>window.SMNAV(x),t);
     }
   }
   check(`all ${clicked} controls clicked without a browser error`,issues.length===0);
   if(issues.length)console.log('       '+[...new Set(issues)].join('\n       '));
   await ctx.close();}

  // 6. Geometry: the persistent rail and the search launcher must not overlap.
  {const ctx=await fresh(browser);const page=await ctx.newPage();
   await page.goto(`http://localhost:${PORT}/index.html`,{waitUntil:'networkidle'});await page.waitForTimeout(300);
   const g=await page.evaluate(()=>{const n=document.getElementById('smBarBottom').getBoundingClientRect(),l=document.getElementById('smSearchLauncher').getBoundingClientRect();
     return {onScreen:n.left>=0&&n.right<=window.innerWidth+1,gap:Math.round(n.top-l.bottom),navH:Math.round(n.height)};});
   check('bottom rail is on screen',g.onScreen);
   check(`search launcher clears the rail (gap ${g.gap}px)`,g.gap>=0);
   await ctx.close();}
 } finally {
   await browser.close(); server.close();
 }
 if(failures){ console.log(`\nE2E FAIL: ${failures} check(s) failed.`); process.exit(1); }
 console.log('\nE2E PASS: routes paint, More and every sub-screen are reachable and returnable, Today acts, no control throws.');
})();
