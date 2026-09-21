/* ---------- PLAN ---------- */
/* Where the plan says you should be, against where the ticks say you are.
   Counted in days rather than percent: "four days behind" is actionable in a way
   that "97.2% adherence" is not. Half-ticked blocks count as half a day. */
/* Arrears. A block left unticked on a past content day is not written off and
   is not doubled onto tomorrow: it queues here, oldest first, and is offered at
   the top of every day until it is done. Whatever will not fit today simply
   stays in the queue, which is what makes the calendar adapt rather than the
   plan quietly falsifying itself. */
/* ---------- RE-PLAN FROM TODAY ---------- */
/* Genuine partial credit, not a blanket reshuffle. A block ticked done is
   dropped; a block ticked half survives at half its minutes AND half its item
   list (via the same trimItems machinery Empathy and fold-back already use);
   an untouched block \u2014 past, today, or still ahead \u2014 survives whole. Order is
   preserved exactly as already sequenced, which is what keeps phase-lock and
   pass-order correct without touching budget() or sequence() at all: this
   only ever repacks blocks the engine already sized, onto a fresh run of
   days, using the same layoutDay() that lays out the day normally. */
function collectRemainingWork(today){
  var out=[];
  plan.content.forEach(function(c){
    var r=state.days[c.date], ch=(r&&r.checks)||{};
    var isFuture=(c.date>today);
    (c.blocks||[]).forEach(function(b){
      if(["lunch","buffer","protected","recall"].indexOf(b.kind)>=0) return;
      var v=isFuture?undefined:ch[b.i];
      if(v===true) return;                       /* fully done \u2014 excluded */
      var frac = (v===0.5) ? 0.5 : 1;             /* half-done or fully untouched */
      var item={}; for(var k in b) item[k]=b[k];
      delete item.start; delete item.endMin; delete item.i; delete item.split;
      if(frac<1) item=SM.cutToTarget([item], Math.round(b.mins*frac), [b.kind], [])[0];
      if(item && item.mins>0.4) out.push(item);
    });
  });
  return out;
}
/* Packs the collected blocks onto a fresh skeleton starting today, filling
   each day to its usual capacity before moving to the next \u2014 the same target
   layoutDay() already lays days out against, just driven directly by minutes
   rather than by topic-slots, since there is no slot structure left to swap
   at this stage the way balance() has for a fresh build. A day or two may run
   a little less evenly than a from-scratch build for that reason; the trade
   is a self-contained repack that cannot touch the tested sizing engine. */
function replanFromToday(anchor){
  var today=anchor||todayISO();
  var remaining=collectRemainingWork(today);
  if(!remaining.length) return {ok:false, error:"Nothing left to replan \u2014 every block is already accounted for."};
  var P=plan.P;
  var Tm=remaining.reduce(function(a,b){return a+b.mins;},0);
  var dailyMin=SM.usableWork(P);
  var needed=Math.max(1, Math.ceil(Tm*1.06/dailyMin));   /* headroom for split/break overhead, matches buildPlan's own margin */
  var P2={}; for(var k in P) P2[k]=P[k];
  P2.startISO=today; P2.hardStartISO=null;
  var skel, contentDays, qi, guard=0;
  do{
    skel=SM.skeleton(P2, needed);
    contentDays=skel.filter(function(c){return !c.rest;});
    qi=0;
    contentDays.forEach(function(c){
      var cap=dailyMin, used=0, items=[];
      while(qi<remaining.length && used<cap){ var b=remaining[qi]; items.push(b); used+=b.mins; qi++; }
      c.rawItems=items;
    });
    if(qi<remaining.length) needed=Math.ceil(needed*1.15)+2;   /* rounding came up short \u2014 grow and retry */
    guard++;
  } while(qi<remaining.length && guard<8);
  /* Greedy packing alone leaves the same lumpiness a from-scratch build's
     balance() step exists to smooth out \u2014 but that function operates on
     topic-slots the repack no longer has. This does the same job at item
     granularity: day i's LAST item was, by construction, immediately BEFORE
     day i+1's FIRST item in the master sequence, so its phase can never
     exceed day i+1's \u2014 moving it forward is provably safe for phase order
     without checking anything, which is what makes this safe to run at all. */
  for(var pass=0; pass<25; pass++){
    var moved=false;
    for(var i=0; i<contentDays.length-1; i++){
      var cur=contentDays[i].rawItems, nxt=contentDays[i+1].rawItems;
      var curWork=cur.reduce(function(a,b){return a+b.mins;},0);
      var nxtWork=nxt.reduce(function(a,b){return a+b.mins;},0);
      if(curWork<=dailyMin || cur.length<2) continue;
      var last=cur[cur.length-1];
      if(nxtWork+last.mins>dailyMin) continue;
      if(curWork-last.mins < dailyMin*0.5) continue;   /* do not create a new problem to fix this one */
      cur.pop(); nxt.unshift(last); moved=true;
    }
    if(!moved) break;
  }
  contentDays.forEach(function(c){
    var laid=SM.layoutDay(c.rawItems,P2);
    c.blocks=laid.blocks; c.endMin=laid.endMin; c.work=laid.work; c.workEnd=laid.workEnd; c.pastBed=laid.pastBed||0;
    c.rawItems=SM.cloneItems(c.rawItems);
  });
  /* A day can have non-empty .blocks (gym, lunch, the evening off) while
     carrying zero actual study content, when the day-count estimate above
     over-provisions \u2014 checking .blocks.length alone let empty trailing days
     through, artificially extending the finish date with days that have
     nothing scheduled on them at all. */
  contentDays=contentDays.filter(function(c){return c.blocks&&c.blocks.length&&c.work>0;});
  contentDays.forEach(function(c,i){ c.n=i+1; });
  /* skel can run past the last day that actually has content \u2014 the same
     over-provisioning that produced empty trailing days also pads the raw
     skeleton, so both the reported finish date and the returned calendar are
     trimmed to the true last day of work rather than the padded estimate. */
  var lastReal = contentDays.length ? contentDays[contentDays.length-1].date : today;
  var trimmedSkel = skel.filter(function(c){ return c.date<=lastReal; });
  var byDate={}; trimmedSkel.forEach(function(c){ byDate[c.date]=c; });
  return { ok:true, CAL:trimmedSkel, content:contentDays, byDate:byDate,
    finish: lastReal,
    asOf:today, builtAt:Date.now(), remainingMin:Tm, shortBy: qi<remaining.length?(remaining.length-qi):0 };
}
/* Installs a computed re-plan as the plan everything else reads. arrears(),
   trajectory(), feasibility, Coach and the timeline all key off plan.content /
   plan.byDate / plan.CAL / plan.finish \u2014 swapping those four fields is the
   entire integration; nothing downstream needs to know a replan happened.
   Only the anchor date persists to state \u2014 the schedule itself is re-derived
   fresh from state.days on every load, so it always reflects whatever has
   actually been ticked since, not a stale snapshot from the moment of the tap. */
function applyReplan(r){
  plan.content=r.content; plan.byDate=r.byDate; plan.CAL=r.CAL; plan.finish=r.finish;
  state.replan={ asOf:r.asOf };
}
/* Called once at load, after the normal build, so a previously-chosen replan
   re-applies with today's actual completion state rather than being lost on
   reload or frozen at the moment it was first requested. Cursor is left
   untouched here \u2014 only the explicit "Apply" action jumps the viewed date,
   so reopening the app does not snap someone back to day one of the replan
   every time regardless of where they have since navigated to. */
/* ---------- CHOOSE TODAY'S TOPIC ----------
   Phase order is a good default, not a cage. If a topic is what you can face
   today, doing it beats doing nothing — especially restarting.
   Implemented as a SWAP of two whole slots between two days, never a
   substitution: both slots already carry their own allocated question ranges,
   so exchanging them conserves every question by construction. Rewriting a
   slot's contents instead would need the item-allocation surgery that has
   twice silently lost questions in this project.
   Swaps persist as dates and slot indices, re-applied after every rebuild, so
   a chosen day survives reload and any later re-plan. */
function applySwaps(){
  (state.swaps||[]).forEach(function(sw){
    var a=plan.byDate[sw.d], b=plan.byDate[sw.withD];
    if(!a||!b||!a.slots||!b.slots) return;
    if(a.slots[sw.i]===undefined||b.slots[sw.withI]===undefined) return;
    var tmp=a.slots[sw.i]; a.slots[sw.i]=b.slots[sw.withI]; b.slots[sw.withI]=tmp;
    /* dayBlocks() already lays the day out and returns the finished shape —
       calling layoutDay on its result was laying out an object rather than a
       block list. */
    [a,b].forEach(function(day){
      var laid=SM.dayBlocks(day,plan.P,plan.B);
      day.blocks=laid.blocks; day.endMin=laid.endMin; day.work=laid.work;
      day.workEnd=laid.workEnd; day.pastBed=laid.pastBed||0;
      day.rawItems=SM.cloneItems(laid.blocks);
    });
  });
}
/* Topics that could be brought forward: the next distinct topics scheduled
   after today, capped so the list stays choosable rather than exhaustive. */
function swapCandidates(date){
  var out=[], seen={}, cur=plan.byDate[date];
  if(!cur||!cur.slots) return out;
  cur.slots.forEach(function(s){ seen[s.ti]=1; });
  /* Every distinct upcoming topic, not the first eight — capping here meant a
     topic further out simply could not be chosen, which is exactly what
     search exists to solve. Callers cap for display instead. */
  for(var i=0;i<plan.content.length;i++){
    var c=plan.content[i];
    if(c.date<=date||!c.slots) continue;
    c.slots.forEach(function(s,si){
      if(seen[s.ti]) return;
      seen[s.ti]=1;
      out.push({ti:s.ti, d:c.date, i:si});
    });
  }
  return out;
}
function reapplyReplanIfAny(){
  if(!state.replan || !state.replan.asOf) return;
  var r=replanFromToday(state.replan.asOf);
  if(r.ok) applyReplan(r);
}

function arrears(before){
  var t=todayISO(), out=[], cap=60;
  for(var i=0;i<plan.content.length && out.length<cap;i++){
    var c=plan.content[i];
    if(c.date>=before || c.date>t) break;
    var r=state.days[c.date]; var ch=(r&&r.checks)||{};
    c.blocks.forEach(function(b){
      if(["lunch","buffer","protected","recall"].indexOf(b.kind)>=0) return;
      if(ch[b.i]===true) return;
      var part=(ch[b.i]===0.5);
      out.push({ date:c.date, b:b, mins: part?Math.round(b.mins/2):b.mins, part:part });
    });
  }
  return out;
}
function arrearsCard(date){
  var A=arrears(date);
  if(!A.length) return "";
  var mins=A.reduce(function(a,x){ return a+x.mins; },0);
  var show=A.slice(0,6);
  return card('<div class="eyebrow amber">Left over from before</div>'+
    '<div class="row-top"><span class="lbl">'+A.length+' block'+(A.length===1?"":"s")+' owed</span>'+
    '<span class="muted sm">'+Math.floor(mins/60)+'h '+(mins%60)+'m</span></div>'+
    '<p class="muted sm">Oldest first. These sit above today\u2019s own work and stay here until they are done \u2014 nothing is doubled onto tomorrow, and nothing is written off.</p>'+
    show.map(function(x){
      return '<div class="bh" style="margin-top:8px"><div class="box sm2'+(x.part?" half":"")+'" data-check="'+x.b.i+
        '" data-cdate="'+x.date+'" data-mins="'+x.b.mins+'">'+(x.part?"&#9680;":"")+'</div>'+
        '<div class="bt"><div class="lbl">'+esc(clip(x.b.head||x.b.label,80))+'</div>'+
        '<div class="muted sm">'+SM.shortDate(x.date)+' &middot; '+x.mins+' min'+(x.part?" left":"")+'</div></div></div>';
    }).join("")+
    (A.length>show.length?'<p class="muted sm">and '+(A.length-show.length)+' more.</p>':'')+
    (mins>SM.usableWork(state.prefs)
      ? '<p class="sm rust">That is more than a whole day on its own. Clear the oldest first and let the rest keep queueing \u2014 do not try to absorb it in one sitting.</p>'
      : '')+
    (mins>SM.usableWork(state.prefs)*3 && !(state.replan&&state.replan.asOf)
      ? '<div class="btnrow" style="margin-top:10px"><button class="btn f1" data-nav="plan">This is more than a bad week \u2014 start fresh from today instead</button></div>'
      : ''), "amber");
}

function trajectory(){
  var t=todayISO(), due=0, done=0;
  plan.content.forEach(function(c){
    if(c.date>t) return;
    due++;
    var r=state.days[c.date]; if(!r||!r.checks) return;
    var real=c.blocks.filter(function(b){
      return ["lunch","buffer","protected"].indexOf(b.kind)<0; });
    if(!real.length) return;
    var got=0;
    real.forEach(function(b){ var v=r.checks[b.i];
      if(v===true) got+=1; else if(v===0.5) got+=0.5; });
    done+=got/real.length;
  });
  return { due:due, done:Math.round(done*10)/10, drift:Math.round((done-due)*10)/10 };
}
/* The same day-by-day logic as trajectory(), kept as a running series instead
   of a single final number \u2014 the shape of the gap (opened gradually, or one
   bad week) matters as much as its current size, and only a graph shows that. */
function trajectorySeries(){
  var t=todayISO(), series=[], doneAcc=0, dueAcc=0;
  plan.content.forEach(function(c){
    if(c.date>t) return;
    dueAcc++;
    var r=state.days[c.date];
    var real=c.blocks.filter(function(b){ return ["lunch","buffer","protected"].indexOf(b.kind)<0; });
    if(r && r.checks && real.length){
      var got=0;
      real.forEach(function(b){ var v=r.checks[b.i]; if(v===true) got+=1; else if(v===0.5) got+=0.5; });
      doneAcc+=got/real.length;
    }
    series.push({date:c.date, actual:doneAcc, projected:dueAcc});
  });
  return series;
}
/* True while the diagnostic window is open: the first N content days exist to
   find out what you actually remember, and ahead/behind arithmetic computed
   from three days of data measures nothing except how recently you started. */
function inDiagnostic(){
  var n=state.prefs.diagnosticDays||0;
  if(!n) return false;
  var t=todayISO(), done=0;
  for(var i=0;i<plan.content.length;i++){ if(plan.content[i].date<=t) done++; else break; }
  return done<=n;
}
function trajCard(){
  if(inDiagnostic()) return "";
  var j=trajectory();
  if(!j.due) return "";
  var behind=j.drift<-0.05, ahead=j.drift>0.05;
  var tone= behind && j.drift<-3 ? "rust" : (ahead?"drape":null);
  var word= behind ? Math.abs(j.drift)+" days behind"
          : ahead  ? j.drift+" days ahead" : "level with the plan";
  return card('<div class="row-top"><span class="lbl">'+word+'</span>'+
    '<span class="muted sm">'+j.done+' of '+j.due+' days done</span></div>'+
    bar(Math.min(100,j.done/j.due*100), behind?"var(--rust)":"var(--drape)",6)+
    '<p class="muted sm">'+
    (behind ? "Behind is information, not failure. The fix is to cut scope on the next lighter day \u2014 never to lengthen a day."
    : ahead ? "Spend the surplus on repair sets and the topics still showing red, not on opening new material early."
    : "Holding the line. Nothing to change.")+'</p>', tone);
}

/* ---- The Fit planner (v15.4) -------------------------------------------
   feasCard has always been able to MEASURE the gap and price the levers; it
   could not apply them, so the honest 158-hour deficit sat there as a fact
   about the plan rather than a decision anyone could take. This is the same
   arithmetic, made operable: pick levers, watch the deficit recompute, commit
   when the number is one you can live with.

   Each lever is priced MARGINALLY — what it saves on top of what is already
   selected — because levers overlap and a list of standalone savings adds up
   to a promise the plan cannot keep. Nothing is applied until Apply is
   pressed, and the third-pass lever states plainly that it breaks the
   three-pass rule rather than hiding it in a tooltip. */
var fitSel={};
/* Every lever also names its OFF value \u2014 not just the value that turns it
   on. Needed now that this lever list has a second entry point (Settings,
   16.2.0, for the third-pass gate specifically): a lever active because it
   was set in Settings, not tapped here, must both show as active here AND
   revert correctly if un-tapped here. */
var FIT_LEVERS=[
  {k:"pb175",label:"Lectures at 1.75\u00d7",group:"pb",pref:{playback:1.75},off:{playback:1.5},
   note:"From 1.5\u00d7. Comprehension holds at this speed for most people on familiar material; it does not on a first pass through something genuinely new."},
  {k:"pb2",label:"Lectures at 2\u00d7",group:"pb",pref:{playback:2},off:{playback:1.5},
   note:"Aggressive. Worth it only if you are already comfortable at 1.75\u00d7 \u2014 re-watching a lecture you did not absorb costs more than the speed saved."},
  {k:"p3y1",label:"Third pass: skip the zero-yield topics",group:"p3",pref:{p3MinYield:1},off:{p3MinYield:0},
   note:"Breaks the three-pass rule, narrowly. Applies only to topics the curriculum rates lowest for INI-SS. Same setting as Third pass in Settings \u2014 changing it here or there is the same change."},
  {k:"p3y2",label:"Third pass: high and standard yield only",group:"p3",pref:{p3MinYield:2},off:{p3MinYield:0},
   note:"Breaks the three-pass rule properly. In exchange, the pass that gets dropped is dropped from the lowest-yield topics deliberately \u2014 which is better than the alternative you currently have, where the plan simply runs past the exam and whatever is last in the calendar gets no third pass at all. Same setting as Third pass in Settings."},
  {k:"rest",label:"Study the weekly rest day",group:"rest",pref:{restDow:-1},off:{restDow:0},
   note:"The biggest single lever on paper and the first one to break in practice. A rest day you keep is worth more than a study day you abandon."}
];
/* Is this lever already the live setting, regardless of how it got there
   (Settings toggle, a previous Apply)? Seeds the chip so an already-active
   lever shows on before this screen is even opened. */
function fitLeverActive(l){
  for(var f in l.pref) if(state.prefs[f]!==l.pref[f]) return false;
  return true;
}
function fitPrefs(sel){
  var P=prefsWithAcc(), out={}; for(var k in P) out[k]=P[k];
  FIT_LEVERS.forEach(function(l){
    var on=l.k in sel ? sel[l.k] : fitLeverActive(l);
    var src=on?l.pref:l.off;
    for(var f in src) out[f]=src[f];
  });
  return out;
}
function fitPlannerCard(){
  var base=SM.feasibility(prefsWithAcc());
  if(!base || base.exam.iso<todayISO()) return "";
  /* Seed from reality first, then let anything explicitly tapped this
     session override the seed \u2014 including turning an already-active lever
     back off. */
  var sel={};
  FIT_LEVERS.forEach(function(l){ sel[l.k]=fitLeverActive(l); });
  for(var k in fitSel) sel[k]=fitSel[k];
  var now=SM.feasibility(fitPrefs(sel));
  /* "Something is on" and "something CHANGED this session" are different
     questions once a lever can already be active via Settings before this
     card is ever opened. Apply/Clear and the summary line care about the
     second one — otherwise Apply shows with nothing new to apply, and the
     summary claims a change happened when the numbers are identical to
     base. */
  var pending=Object.keys(fitSel).some(function(k){
    var l=FIT_LEVERS.filter(function(x){return x.k===k;})[0];
    return l && fitSel[k]!==fitLeverActive(l);
  });
  var chips=FIT_LEVERS.map(function(l){
    /* Marginal cost of THIS lever against the current selection. */
    var probe={}; for(var k in sel) probe[k]=sel[k];
    if(probe[l.k]){ probe[l.k]=false; }
    else { FIT_LEVERS.forEach(function(o){ if(o.group===l.group) probe[o.k]=false; }); probe[l.k]=true; }
    var alt=SM.feasibility(fitPrefs(probe));
    var delta=Math.round(now.deficitH-alt.deficitH);
    var tag=sel[l.k] ? (delta<0?"+"+Math.abs(delta)+"h if removed":"on")
                     : (delta>0?"\u2212"+delta+"h":"no change");
    return '<button type="button" class="btn sm'+(sel[l.k]?" solid":"")+'" data-fit="'+l.k+'" '+
      'style="text-align:left;flex:1 1 100%">'+esc(l.label)+' <span class="muted">\u00b7 '+tag+'</span></button>'+
      '<p class="muted sm" style="margin:2px 0 8px">'+esc(l.note)+'</p>';
  }).join("");
  var pct=Math.max(0,Math.min(100,now.capH/Math.max(1,now.needH)*100));
  var head='<div class="row-top"><span class="eyebrow'+(now.fits?" drape":" amber")+'">Make it fit</span>'+
    '<span class="muted sm">'+SM.pretty(now.exam.iso)+'</span></div>'+
    bar(pct,now.fits?"var(--prog)":"var(--rust)",12,
      {sub:now.needH+' h needed \u00b7 '+now.capH+' h available',
       value:now.fits?'fits':now.deficitH+'h short'})+
    (pending?'<p class="muted sm">Was '+base.deficitH+'h short. '+
      (now.fits?'With these changes it fits, with '+Math.abs(now.deficitH)+'h to spare.'
              :'With these changes it is '+now.deficitH+'h short.')+'</p>'
          :'<p class="muted sm">Nothing changed on this screen yet. Tap a lever to see what it is actually worth — a solid button is already active, from here or from Settings.</p>');
  var apply=pending?'<div class="btnrow topline"><button class="btn solid f1" id="fitApply">Apply these changes</button>'+
    '<button class="btn sm" id="fitReset">Clear</button></div>'+
    '<p class="muted sm">Applying rewrites your settings and rebuilds the plan. Logged work is untouched.</p>':"";
  return card(head+'<div class="btnrow" style="flex-wrap:wrap;margin-top:10px">'+chips+'</div>'+apply,
    now.fits?"drape":"amber");
}

/* The counts every scheduled hour is derived from were read off another
   platform's screens. This puts the one statistical outlier in front of the
   person who can check it, with the hours at stake attached. It does not
   offer to "fix" the number: the MCQ ledger is keyed by question number, so
   rewriting a count silently would orphan logged attempts, and there is no way
   from inside the app to know which of the two figures is the wrong one. */
function dataIntegrityCard(){
  var a=[];
  try{ a=SM.dataAnomalies(prefsWithAcc())||[]; }catch(e){ return ""; }
  if(!a.length) return "";
  return a.map(function(x){
    return card('<div class="eyebrow amber">Check this number before you trust the plan</div>'+
      '<p class="sm"><b>'+esc(x.topic)+'</b> is recorded as <b>'+x.bank.toLocaleString()+' bank questions</b> across '+
      x.lectures+' lecture'+(x.lectures===1?'':'s')+' \u2014 '+x.ratio+' questions per lecture, against a median of '+
      x.medianRatio+' across the whole curriculum. It is the only topic in the syllabus that is a statistical outlier.</p>'+
      '<p class="sm">If it is right, nothing needs doing. If it is a capture error'+
      (x.tenth?' \u2014 the likeliest single explanation is a factor-of-ten slip, i.e. '+x.tenth+' rather than '+x.bank.toLocaleString():'')+
      ' \u2014 then roughly <b>'+x.hours+' hours</b> of this campaign are scheduled against questions that do not exist.</p>'+
      '<p class="muted sm">Open the topic on the source platform and count. I have not corrected it: the question ledger is keyed by question number, so changing the count here would orphan every attempt you have already logged against it.</p>','amber');
  }).join("");
}

function feasCard(full){
  /* Suppressed on Today during the diagnostic window; the full panel stays
     available on Plan for anyone who deliberately goes looking for it. */
  if(!full && inDiagnostic()) return "";
  var f=SM.feasibility(prefsWithAcc());
  if(!f) return "";
  /* A configured exam date sitting in the past produces zero capacity by
     construction (no days remain before it), which then reads as an enormous,
     confusing deficit rather than what it actually is: a stale date nobody
     updated. Named plainly, with the fix one field away, instead of dressed up
     as hundreds of hours short. */
  if(f.exam.iso<todayISO())
    return card('<div class="eyebrow rust">This target date has passed</div>'+
      '<p class="sm">'+f.style.label+' was set to '+SM.pretty(f.exam.iso)+', which is now in the past. '+
      'Update it below \u2014 the deficit shown until then is not meaningful.</p>','rust');
  if(f.fits) return full ? card('<div class="eyebrow drape">Inside the target date</div>'+
    '<p class="sm">All '+f.needH+' hours land before '+SM.pretty(f.exam.iso)+', inside '+
    f.capH+' hours of capacity.</p>','drape') : "";
  var body='<div class="eyebrow amber">Behind the target date</div>'+
    '<div class="g3 mb">'+
    '<div><div class="big2 rust">'+f.deficitH+'h</div><div class="muted sm">short</div></div>'+
    '<div><div class="big3">'+f.needH+'h</div><div class="muted sm">needed</div></div>'+
    '<div><div class="big3">'+f.capH+'h</div><div class="muted sm">available</div></div></div>'+
    '<p class="sm">'+f.daysBefore+' study days remain before '+f.style.label+' on '+SM.pretty(f.exam.iso)+
    '. At '+f.dailyH.toFixed(2)+' h of real work a day that is '+f.capH+' hours. The syllabus, worked '+
    (state.prefs.passes||3)+' times, needs '+f.needH+'. The date is a target, not a wall \u2014 the plan keeps going past it rather than dropping content, and every question still gets its three passes.</p>'+
    (full ? '<p class="muted sm">The levers that close this \u2014 lecture speed, the third pass, the rest day \u2014 are tappable in Make it fit below, priced against exactly this number.</p>'
          : '<p class="muted sm">Open Plan to see which levers close the gap.</p>');
  return card(body, f.deficitH>120 ? "rust" : "amber");
}

