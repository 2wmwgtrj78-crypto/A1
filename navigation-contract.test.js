const assert=require('assert'); const fs=require('fs');
const root=__dirname+'/..';
const html=fs.readFileSync(root+'/index.html','utf8');
const ui=fs.readFileSync(root+'/ui.js','utf8');

/* ---- shell contract ---------------------------------------------------- */
assert(html.includes('id="smBarBottom"'),'bottom navigation missing');
assert(/data-tab="more" data-go-tab="more"/.test(html),'More must have an explicit route');
assert(!/data-tab="more"[^>]*onclick=/.test(html),'More must not depend on inline onclick');
assert((html.match(/class="railbtn/g)||[]).length===4,'primary navigation should contain four rail buttons');
assert(ui.includes('dataset.smNavGateway'),'single navigation gateway missing');
assert(!ui.includes('dataset.smNavCapture'),'legacy competing navigation guard remains');
assert(ui.includes('persistent rail is owned by the capture gateway'),'duplicate rail routing guard missing');

/* ---- SCOPE INTEGRITY ---------------------------------------------------
   This is the check 15.0.2 needed and did not have. ui-core.part.js opens one
   `(function(){` that scopes the whole UI and ui-render-ai.part.js closes it.
   In 15.0.2 the build concatenated ui-simple-v14.part.js AFTER the close, so
   renderMore() ran at global scope where `esc` does not exist: tapping More
   threw, SMNAV swallowed it, and six screens were unreachable. Every
   string-grep assertion in this file still passed, because the strings were
   all present. Nothing may follow the IIFE close but whitespace and comments. */
const closeAt=ui.lastIndexOf('\n})();');
assert(closeAt>0,'UI bundle must be wrapped in a single IIFE');
const trailing=ui.slice(closeAt+6).replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'').trim();
assert(trailing==='','code after the UI closure runs at global scope and cannot see esc/state/plan: '+trailing.slice(0,120));

/* ---- NO SHADOWED RENDERERS --------------------------------------------
   Two functions with the same name in one scope means the later declaration
   silently wins and the earlier body is unreachable. That is how ~100 lines of
   duplicate Today/Learn/Practice/Progress markup survived several releases
   without ever rendering once. */
const decls={};
for(const m of ui.matchAll(/^function ([A-Za-z0-9_$]+)\s*\(/gm)) decls[m[1]]=(decls[m[1]]||0)+1;
const shadowed=Object.keys(decls).filter(function(k){return decls[k]>1;});
assert(shadowed.length===0,'duplicate top-level function declarations shadow each other: '+shadowed.join(', '));

/* ---- routes ------------------------------------------------------------ */
const required=['study','log','plan','settings','help','ai'];
for(const r of required) assert(new RegExp('data-go-tab="'+r+'"').test(ui),'More route missing: '+r);
assert(ui.includes('var SUBSCREENS='),'sub-screen table missing');
for(const r of required) assert(new RegExp('SUBSCREENS=\\{[^}]*'+r+':1').test(ui),'sub-screen not registered for the back bar: '+r);
assert(ui.includes('dm24-subnav') && ui.includes('Back to More'),'sub-screen back affordance missing');
/* The back bar must not be a <nav>: bare `nav{position:fixed;bottom:...}` rules
   in surgimaster.css pin any <nav> under the tab bar, where it cannot be tapped. */
assert(!/<nav class="dm24-subnav/.test(ui),'the back bar must not be a <nav> element - unscoped nav{} rules pin it off-screen');

/* ---- dead route removed ------------------------------------------------ */
const code=ui.replace(/\/\*[\s\S]*?\*\//g,'');
assert(!/myday/.test(code),'the myday route only re-rendered Today and should stay removed');

console.log('NAVIGATION CONTRACT PASS: shell, scope integrity, no shadowed renderers, sub-routes and back affordance verified.');
