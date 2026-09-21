const assert=require('assert'); const fs=require('fs'); const path=require('path');
const root=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const ui=read('ui.js'), engine=read('engine.js');

/* Three day models, one table. Layer used to be a hand-written boolean in six
   places, which is why a third model was not a one-line change. */
assert(/var LAYERS=\[/.test(ui),'day models must come from one table');
for(const id of ['normal','empathy','low'])
  assert(new RegExp('id:"'+id+'"').test(ui),`day model missing: ${id}`);
assert(ui.includes('function layerHours')&&ui.includes('function layerName')&&ui.includes('function layerClock'),
  'layer helpers must be shared by the picker, Settings and the shaper');

/* Low is 3 h 15 m. Stated in engine defaults, not in the view. */
assert(/lowHours:\s*3\.25/.test(engine),'Low day must be 3.25 h (3 h 15 m)');
assert(/empathyHours:\s*7\.25/.test(engine),'Empathy day must stay 7.25 h');
assert(/dailyHours:\s*9\.25/.test(engine),'Normal day must stay 9.25 h');

/* The picker and Settings must both be driven by the table, or a fourth model
   appears in one and not the other. */
assert(ui.includes('LAYERS.map(function(L){'),'the Today picker must render from LAYERS');
assert(!/data-layer="empathy"\]\]/.test(ui),'the Today picker must not hard-code a two-tier list');
assert(/order=\["empathy","normal","low"\]/.test(ui),'the default-day setting must cycle all three models');

/* A Low day is shaped like a ramp day: lectures out, questions and their
   analysis scaled together. Priority-order cutting would leave the questions
   on the floor and keep a full analysis block. */
assert(/rampLeft>0 \|\| layer==="low"/.test(ui),'Low must use proportional shaping, not priority cutting');

/* Protected time is not study and is not paid for out of the study budget.
   Before this, a 3 h 15 m day balanced its arithmetic by halving lunch. */
assert(/var FIXED=\["lunch","buffer","protected"\]/.test(ui),'fixed personal blocks must be identified');
assert(/ownItems=flex\.concat\(prot\)\.concat\(fixed\)/.test(ui),'fixed blocks must pass through unscaled');
assert(/var fixed=keep\.filter/.test(ui) && /var work=keep\.filter/.test(ui),
  'the study budget must be computed over study blocks only');

/* Switching a partly-done day discards index-keyed ticks; that must be asked,
   not done silently, because Low exists for the day that falls apart at noon. */
assert(ui.includes('if(r.layer===b.dataset.layer) return;'),'re-tapping the current day model must be a no-op');
assert(/confirm\(\s*"Switching to the "\+layerName/.test(ui),'a partly-done day must warn before its ticks are cleared');

/* Low days are counted and surfaced, like Empathy days. A short day is a
   measurement, not a moral failure — but it still costs campaign hours. */
assert(ui.includes('F.lowDays=lay.low;'),'Low days must be counted in the forecast');
assert(ui.includes('Low days are adding up'),'a run of Low days must be surfaced with its cost');

console.log('DAY MODELS PASS: Normal 9h15m / Empathy 7h15m / Low 3h15m from one table, Low shaped proportionally, protected time outside the budget, switches guarded and counted.');
