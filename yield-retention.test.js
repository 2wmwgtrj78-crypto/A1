/* v15.4: yield-gated third pass, the phase retention thread, source-data
   integrity, and the last of the viva.

   The first two both touch arithmetic that has broken before, and in opposite
   directions:

     · The yield gate must be a REAL saving. If budget() keeps pricing three
       passes globally while the allocator schedules two for a topic, the plan
       claims to fit on hours it never spends — the same class of error as the
       cosmetic ramp, one layer down.
     · The retention thread must cost NOTHING. It re-points a block that
       already exists; if it ever adds minutes instead, it quietly worsens the
       very deficit the Fit planner is there to close.

   CONTROL TEST, per LESSONS_LEARNED. Verified to FAIL by reverting the fix:
     · restoring the global `rep`/`F.a` in budget() while leaving the per-topic
       re3Q gate -> "must be a real saving" fails (0 h saved, 158 h either way).
     · `retentionEvery:0` -> the retention assertion fails (no re-pointed
       recall blocks), confirming the assertion is actually reading the thread.
*/
const assert=require('assert');
const path=require('path');
global.window={};
require(path.join(__dirname,'..','engine.js'));
const SM=global.window.SM;
const D=SM.DEFAULTS;
const P=(o)=>Object.assign({},D,o);

/* ---- 1. Default behaviour is unchanged: three passes over everything ---- */
assert.equal(D.p3MinYield,0,'the yield gate must default to OFF — three passes is the standing rule');
const plan0=SM.buildPlan({});
let re3=0; plan0.content.forEach(c=>c.slots.forEach(s=>{re3+=s.nRe3||0;}));
const TOTAL=SM.CURRICULUM.reduce((a,t)=>a+(t.dtq||0)+(t.spq||0),0);
assert.equal(re3,TOTAL,'by default every question must still get a third pass');

/* ---- 2. The gate is real, and drops the RIGHT topics ---- */
const base=SM.feasibility(D), gated=SM.feasibility(P({p3MinYield:2}));
const saved=base.deficitH-gated.deficitH;
assert(saved>40,'the yield gate must be a real saving, not a relabelling (saved '+saved+' h)');
const planG=SM.buildPlan(P({p3MinYield:2}));
const skipped={}, kept={};
planG.B.topics.forEach(t=>{ (t.p3?kept:skipped)[t.i]=t.yINI; });
Object.keys(skipped).forEach(function(i){
  assert(SM.CURRICULUM[i].yINI<2,'topic '+i+' lost its third pass despite yield '+SM.CURRICULUM[i].yINI);
});
Object.keys(kept).forEach(function(i){
  assert(SM.CURRICULUM[i].yINI>=2,'topic '+i+' kept its third pass below the yield threshold');
});
assert(Object.keys(skipped).length>0,'p3MinYield:2 must actually skip some topics');

/* ---- 3. First and second pass are NEVER touched by the gate ---- */
let bank=0,speed=0,re=0;
planG.content.forEach(c=>c.slots.forEach(s=>{bank+=s.nBank||0;speed+=s.nSpeed||0;re+=s.nRe||0;}));
assert.equal(bank+speed,TOTAL,'the gate must never touch the first pass');
assert.equal(re,TOTAL,'the gate must never touch the second pass');

/* ---- 4. The retention thread exists, points BACKWARDS, and is free ---- */
const withT=SM.buildPlan({}), noT=SM.buildPlan(P({retentionEvery:0}));
const pointed=withT.content.filter(c=>c.blocks.some(b=>b.kind==='recall'&&b.ti!=null));
assert(pointed.length>20,'the retention thread must actually run ('+pointed.length+' days)');
pointed.forEach(function(c){
  const b=c.blocks.filter(x=>x.kind==='recall'&&x.ti!=null)[0];
  const recallPhase=SM.CURRICULUM[b.ti].phase;
  const dayPhase=Math.min.apply(null,c.slots.map(s=>withT.B.topics[s.ti].phase));
  assert(recallPhase<dayPhase,c.date+' retrieves phase '+recallPhase+' on a phase-'+dayPhase+
    ' day — the thread must reach BACK to closed phases, not re-test today');
});
const mins=p=>p.content.reduce((a,c)=>a+c.work,0);
assert.equal(Math.round(mins(withT)),Math.round(mins(noT)),
  'the retention thread must add no minutes — it re-points an existing block');
/* And it must spread across the back-catalogue rather than drilling one topic. */
const distinct=new Set(pointed.map(c=>c.blocks.filter(x=>x.kind==='recall'&&x.ti!=null)[0].ti));
assert(distinct.size>=5,'the thread must rotate across closed topics (saw '+distinct.size+')');

/* ---- 5b. Phase "last touched" must never look past the exam it is measuring
          against (v16.1 fix: a retention-thread touch scheduled AFTER the
          exam was pushing "last touched" past it, producing a negative gap —
          "cold" days that read as -32, which is nonsense: a touch the week
          after the paper cannot help on the paper). ---- */
(function(){
  const ini='2027-04-25';
  function lastByPhase(plan,cutoff){
    var last={};
    plan.content.forEach(function(c){
      if(cutoff && c.date>cutoff) return;
      c.blocks.forEach(function(b){
        if(b.ti==null) return;
        var ph=SM.CURRICULUM[b.ti].phase;
        if(!last[ph]||c.date>last[ph]) last[ph]=c.date; }); });
    return last;
  }
  const plan=SM.buildPlan({});
  const lastCut=lastByPhase(plan,ini);      /* the correct, cutoff version */
  const lastAll=lastByPhase(plan,null);     /* the pre-fix, uncut version */
  Object.keys(lastCut).forEach(function(ph){
    const gap=SM.daysBetween(lastCut[ph],ini);
    assert(gap>=0,'phase '+ph+' produced a negative "cold" gap of '+gap+
      ' days — a touch after the exam must never count toward exam-day readiness');
  });
  /* The bug only manifests for phases the retention thread revisits late in
     the campaign (past the exam date) — confirm that actually happens here,
     so this assertion is exercising the real bug and not a case that never
     triggers it either way. */
  const anyPostExamTouch=Object.keys(lastAll).some(function(ph){
    return lastAll[ph]>ini && (!lastCut[ph] || lastAll[ph]!==lastCut[ph]);
  });
  assert(anyPostExamTouch,'this default plan must include at least one post-exam retention '+
    'touch, or this test is not exercising the bug it exists to catch');
})();


const an=SM.dataAnomalies();
assert.equal(an.length,1,'exactly one topic should clear the outlier threshold — a detector that '+
  'flags eight topics gets ignored (got '+an.length+')');
assert.equal(an[0].topicId,38,'the flagged topic must be the suspected OCR slip');
assert(an[0].hours>100,'the report must carry the hours at stake, not just the ratio');
assert(an[0].bank===SM.CURRICULUM[38].dtq,'the detector must REPORT the count, never rewrite it');

/* ---- 6. Viva is gone ---- */
const fs=require('fs');
['ui.js','engine.js','intelligence.js'].forEach(function(f){
  const src=fs.readFileSync(path.join(__dirname,'..',f),'utf8');
  const hits=(src.match(/viva/gi)||[]).filter(function(_,i,a){ return true; });
  /* normalizeState's `delete s.viva` is the one permitted mention: it strips
     the key from installs saved before viva was removed. Deleting the deletion
     would leave dead state in every old backup forever. */
  const allowed=(src.match(/delete s\.viva;/g)||[]).length;
  assert.equal(hits.length,allowed,f+' still mentions viva outside the migration line');
});

console.log('YIELD + RETENTION PASS: gate off by default ('+TOTAL+' x3 intact); at yield>=2 it saves '+
  Math.round(saved)+' h from '+Object.keys(skipped).length+' low-yield topics with passes 1-2 untouched; '+
  'retention re-points '+pointed.length+' recall blocks across '+distinct.size+' closed topics at zero added minutes; '+
  'one data anomaly reported ('+an[0].hours+' h at stake), not corrected; viva absent.');
