/* Intelligent scheduler (v15.2).

   WHY THIS FILE EXISTS
   --------------------
   Every previous scheduling bug in this project was an ARITHMETIC bug that
   looked fine on screen: questions silently lost, a day quietly inflated, a
   topic that ate a whole session because nothing capped it. A scheduler that
   "looks sensible" is not evidence. So the checks below are the invariants
   the layout is only allowed to exist inside:

     · minutes are conserved (slots*slotMinutes + spare === minutes in),
     · the plan is never mutated (the state object is byte-identical after),
     · no topic outside the ones handed in can appear (phase-lock holds),
     · no topic takes more than half the slots while another is eligible,
     · no topic runs twice in a row while another is eligible,
     · the same inputs produce the same output, always.

   CONTROL TEST, per LESSONS_LEARNED. Verified to FAIL by deliberately
   breaking the code they guard:
     · conservation  — folding the remainder into the slots (spare=0):
       fails, actual 180 vs expected 185.
     · interleaving  — removing the same-topic swap: fails on adjacent slots.

   HONEST GAP: the half-session cap assertion has NOT been seen to fail. With
   round-robin assignment the slots distribute evenly on their own, so the cap
   is currently unreachable — it is a regression net for a future risk-weighted
   assignment, not a verified control. It is left in deliberately and labelled
   rather than deleted or quietly counted as passing evidence.
*/
const assert=require('assert');
const path=require('path');
const root=path.join(__dirname,'..');
global.window={};
require(path.join(root,'engine.js'));
require(path.join(root,'intelligence.js'));
const SM=global.window.SM;

assert(typeof SM.intelligentSchedule==='function','intelligentSchedule must be exported');

/* Three topics with genuinely different evidence: one dangerous (confident
   errors), one weak, one well-established. */
const state={mcq:{
  a1:{topicId:3,subtopic:'x',number:'1',attempts:[{t:1,outcome:'wrong',conf:3},{t:2,outcome:'wrong',conf:3}]},
  a2:{topicId:3,subtopic:'x',number:'2',attempts:[{t:3,outcome:'wrong',conf:2}]},
  b1:{topicId:7,subtopic:'y',number:'1',attempts:[{t:4,outcome:'wrong',conf:1},{t:5,outcome:'wrong',conf:1}]},
  b2:{topicId:7,subtopic:'y',number:'2',attempts:[{t:6,outcome:'right',conf:2}]},
  c1:{topicId:12,subtopic:'z',number:'1',attempts:[{t:7,outcome:'right',conf:3},{t:8,outcome:'right',conf:3}]}
},scores:{},repairs:{},misses:[]};
const before=JSON.stringify(state);
const ids=[3,7,12];
const NOW=20*SM.DAY;

const s=SM.intelligentSchedule(state,{minutes:185,slotMinutes:30,topicIds:ids,now:NOW});

/* 1. conservation — the single invariant that has broken this project before */
assert.equal(s.slots.length,6,'185 min at 30 min a slot must lay out 6 slots');
assert.equal(s.slots.length*s.slotMinutes+s.spare,185,'minutes must be conserved exactly');
assert.equal(s.spare,5,'the remainder must be reported as buffer, never folded into a block');
s.slots.forEach(function(x){ assert.equal(x.minutes,30,'no slot may differ from the declared slot length'); });

/* 2. purity — advisory means advisory */
assert.equal(JSON.stringify(state),before,'the scheduler must not mutate state');

/* 3. phase-lock holds by construction */
s.slots.forEach(function(x){ assert(ids.indexOf(x.topicId)>=0,'a topic outside the day\u2019s own slots must never appear'); });

/* 4. no topic eats the session */
const counts={};
s.slots.forEach(function(x){ counts[x.topicId]=(counts[x.topicId]||0)+1; });
const cap=Math.ceil(s.slots.length/2);
Object.keys(counts).forEach(function(k){ assert(counts[k]<=cap,'topic '+k+' took '+counts[k]+' of '+s.slots.length+' slots, over the half-session cap'); });

/* 5. interleaving */
assert(s.interleaved,'three eligible topics in a 3-hour session must interleave');
for(let i=1;i<s.slots.length;i++)
  assert(s.slots[i].topicId!==s.slots[i-1].topicId,'slots '+(i-1)+' and '+i+' repeat the same topic back to back');

/* 6. hypercorrection first, retrieval last */
assert.equal(s.slots[0].mode,'recall','a confident error in the pool must open the session');
assert.equal(s.slots[s.slots.length-1].mode,'closure','a session of 3+ slots must close on closed-notes recall');

/* 7. every slot explains itself — an unexplained recommendation is not usable */
s.slots.forEach(function(x){ assert(x.label && Array.isArray(x.why),'each slot must carry a label and its reasons'); });

/* 8. determinism */
const again=SM.intelligentSchedule(state,{minutes:185,slotMinutes:30,topicIds:ids,now:NOW});
assert.equal(JSON.stringify(again),JSON.stringify(s),'identical inputs must produce an identical schedule');

/* 9. breadth is bounded by time, not by ambition: a single 30-minute block is
      one topic, not three tourist stops */
const short=SM.intelligentSchedule(state,{minutes:30,slotMinutes:30,topicIds:ids,now:NOW});
assert.equal(short.slots.length,1,'30 minutes is one slot');
assert.equal(short.interleaved,false,'a single block must not claim to interleave');

/* 10. below one block the scheduler declines rather than inventing a plan */
const tiny=SM.intelligentSchedule(state,{minutes:20,slotMinutes:30,topicIds:ids,now:NOW});
assert.equal(tiny.slots.length,0,'less than one slot must produce no slots');
assert.equal(tiny.spare,20,'and must hand every minute back');

/* 11. an empty allow-list falls back to the whole curriculum rather than
       throwing — Today can be a rest day with no slots at all */
const open=SM.intelligentSchedule(state,{minutes:60,slotMinutes:30,topicIds:[],now:NOW});
assert.equal(open.slots.length,2,'an unrestricted call must still lay out the time');

console.log('SCHEDULER PASS: minutes conserved ('+s.slots.length+'\u00d7'+s.slotMinutes+'+'+s.spare+'=185), state unmutated, phase-lock respected, half-session cap held, interleaving enforced, hypercorrection first, closure last, deterministic.');
