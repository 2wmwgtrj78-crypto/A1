const fs = require('fs');
const path = require('path');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const VERSION = String(pkg.version);
if(!/^\d+\.\d+\.\d+$/.test(VERSION)) throw new Error('package.json version must be semver x.y.z');
/* ORDER IS LOAD-BEARING. ui-core.part.js OPENS the single `(function(){` that
   scopes the whole UI; ui-render-ai.part.js CLOSES it with `})();`. Anything
   concatenated after ui-render-ai therefore lands at global scope, where
   `esc`, `state`, `plan`, `tab` and `shapeToday` do not exist.

   That is exactly what shipped in 15.0.2: ui-simple-v14.part.js sat last, so
   renderMore() threw `esc is not defined` on every tap of the More tab and the
   session-start handler threw `shapeToday is not defined`. Six screens were
   unreachable. The closing part must stay last; the assertion below enforces
   it so the same mistake cannot be made silently again. */
const parts = [
  'ui-core.part.js',
  'ui-learning.part.js',
  'ui-practice-progress.part.js',
  'ui-plan.part.js',
  'ui-session.part.js',
  'ui-search.part.js',
  'ui-simple-v14.part.js',
  'ui-render-ai.part.js'
];
const dir = path.join(__dirname, 'ui-modules');
const sources = parts.map(p => fs.readFileSync(path.join(dir, p), 'utf8'));
const closers = parts.filter((p, i) => /^\}\)\(\);\s*$/m.test(sources[i]));
if (closers.length !== 1) throw new Error(`exactly one module must close the UI IIFE, found ${closers.length}: ${closers.join(', ')}`);
if (closers[0] !== parts[parts.length - 1]) throw new Error(`the module closing the UI IIFE (${closers[0]}) must be last, or later modules land at global scope`);
const out = parts.map((p, i) => `\n/* ===== UI MODULE ${i + 1}: ${p} ===== */\n` + sources[i]).join('\n');
fs.writeFileSync(path.join(__dirname, 'ui.js'), `/* Dakshinamurthy UI production bundle — ${VERSION}. Generated; edit ui-modules instead. */\n` + out);
const intelligencePath=path.join(__dirname,'intelligence.js');
let intelligence=fs.readFileSync(intelligencePath,'utf8').replace("SM.VERSION='__VERSION__'", `SM.VERSION='${VERSION}'`);
fs.writeFileSync(intelligencePath,intelligence);
const indexPath=path.join(__dirname,'index.html');
let index=fs.readFileSync(indexPath,'utf8').replace(/(<meta name=\"application-version\" content=\")[^\"]+(\")/, `$1${VERSION}$2`);
fs.writeFileSync(indexPath,index);
const swPath=path.join(__dirname,'sw.js');
let sw=fs.readFileSync(swPath,'utf8').replace(/CACHE_NAME='dakshinamurthy-v[^']*'/, `CACHE_NAME='dakshinamurthy-v${VERSION}'`).replace(/RELEASE='[^']*'/, `RELEASE='${VERSION}'`);
fs.writeFileSync(swPath,sw);
console.log(`Built ui.js from ${parts.length} modules (${out.split(/\r?\n/).length} lines), release ${VERSION}.`);
