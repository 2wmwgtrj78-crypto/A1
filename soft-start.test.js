/* Soft start (v15.3): orientation day + a genuinely lighter first week.

   WHY THIS FILE EXISTS
   --------------------
   The soft start has now been broken in two different ways, both of which
   looked correct in the source:

     1. `skeleton()` hardcoded `soft:false`, so `rampDays` existed only in
        shapeToday — the screen trimmed the day to 3 h while the allocator had
        already committed a full day of slots to it. The difference became
        arrears, which means a deliberately gentle first week opened by
        generating its own backlog.
     2. Once `soft` was set correctly, `level()` and `balance()` immediately
        undid it: they push slots onto any day under capacity, and a one-slot
        opening day is the most under-capacity day in the campaign. Week one
        refilled itself to 7-8 h within two passes, silently.

   Defect 2 is the reason this file exists rather than a single assertion on
   skeleton() output: the bug appeared AFTER the balancing steps, so only the
   finished plan is evidence.

   CONTROL TEST, per LESSONS_LEARNED. Verified to FAIL by reverting the fix:
     · restoring `soft:false` in skeleton()      -> soft-day count assertion fails (0 soft days).
     · restoring the literal `3` slot ceiling in level()/balance()
                                                 -> one-slot assertion fails (days carry 2).
*/
const assert=require('assert');
const path=require('path');
global.window={};
require(path.join(__dirname,'..','engine.js'));
const SM=global.window.SM;
const P=SM.DEFAULTS;

const plan=SM.buildPlan({});

/* ---- 1. Day one is orientation, and it is NOT a content day ---- */
const day1=plan.CAL[0];
assert.equal(day1.date,P.startISO,'the campaign must open on the configured start date');
assert.equal(day1.kind,'orient','day one must be the orientation day');
assert.equal(day1.rest,true,'orientation must be a rest-kind day so it carries no syllabus slots');
assert(!plan.content.some(c=>c.date===P.startISO),'the orientation day must never appear as a content day');
const orient=SM.specialDay(day1,P);
assert(orient.blocks.length>=4,'the orientation day must present a real checklist, not an empty day');
assert(orient.work<=180,'orientation must stay light — it is set-up, not a study day');

/* ---- 2. The first rampDays content days are soft, and STAY soft ---- */
const soft=plan.content.filter(c=>c.soft);
assert.equal(soft.length,P.rampDays,'exactly rampDays content days must be soft');
assert.deepEqual(soft.map(c=>c.date),plan.content.slice(0,P.rampDays).map(c=>c.date),
  'the soft days must be the FIRST content days, not scattered through the campaign');
soft.forEach(function(c){
  assert.equal(c.slots.length,1,c.date+' carries '+c.slots.length+' slots — the balancing passes have refilled the soft week again');
});

/* ---- 3. Soft days are actually lighter than normal days ---- */
const full=plan.content.filter(c=>!c.soft);
const avgSoft=soft.reduce((a,c)=>a+c.work,0)/soft.length;
const avgFull=full.reduce((a,c)=>a+c.work,0)/full.length;
assert(avgSoft<avgFull*0.7,'the soft week must be materially lighter, not nominally lighter ('+
  Math.round(avgSoft)+' min vs '+Math.round(avgFull)+' min)');

/* ---- 4. The ramp ceiling must not re-create the arrears it was meant to
          prevent. If rampHours trims a soft day, the difference is backlog on
          day one of the campaign. ---- */
const rampCap=P.rampHours*60;
soft.forEach(function(c){
  assert(c.work<=rampCap,c.date+' allocates '+Math.round(c.work)+' min but the ramp ceiling is '+
    rampCap+' min — the shaper would trim it and bank the difference as arrears');
});

/* ---- 5. Nothing was lost. A lighter week must move work forward, never
          delete it — this is the failure mode that cost this project 279
          questions once before. ---- */
let bank=0,speed=0,lec=0,re=0,re3=0;
plan.content.forEach(c=>c.slots.forEach(function(s){
  bank+=s.nBank||0; speed+=s.nSpeed||0; lec+=s.nLec||0; re+=s.nRe||0; re3+=s.nRe3||0;
}));
const TOTAL=SM.CURRICULUM.reduce((a,t)=>a+(t.dtq||0)+(t.spq||0),0);
assert.equal(bank+speed,TOTAL,'first-pass questions must still total '+TOTAL);
assert.equal(re,TOTAL,'second pass must still cover every question');
assert.equal(re3,TOTAL,'third pass must still cover every question');
assert.equal(lec,SM.CURRICULUM.reduce((a,t)=>a+(t.nlec||0),0),'every lecture must still be scheduled');

console.log('SOFT START PASS: orientation day '+day1.date+' carries no slots; '+soft.length+
  ' soft content days hold one slot each at '+Math.round(avgSoft)+' min vs '+Math.round(avgFull)+
  ' min normal, inside the '+rampCap+'-min ramp ceiling; 3 passes x '+TOTAL+' questions conserved; finish '+plan.finish+'.');
