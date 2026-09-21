/* Today's evidence bridge (recovery signal, repair targeting, primary-block
   selection) and the More screen. The adaptive engine stays intact; this module
   only decides what Today and More present. Must stay INSIDE the UI closure —
   every function here uses state, plan, esc and shapeToday. */

function smSimpleHeader(kicker,title,copy){
  var sub=(typeof tab!=="undefined" && ["today","study","revise","progress","more"].indexOf(tab)<0);
  return '<div class="dm24-header"><div class="dm24-kicker">'+esc(kicker)+'</div><h2>'+esc(title)+'</h2>'+
    (copy?'<p>'+esc(copy)+'</p>':'')+
    (sub?'<button type="button" class="dm24-back" data-go-tab="more" aria-label="Back to More">← Back to More</button>':'')+
    '</div>';
}
function smSimpleTodayStats(entry,date,r){
  var f=entry&&entry.kind==='content'?shapeToday(entry,date,plan.P,r):null;
  var blocks=f?(f.shaped.blocks||[]):(entry&&entry.blocks||[]);
  var work=blocks.filter(function(b){return ['lunch','buffer','protected'].indexOf(b.kind)<0;});
  var done=0;
  work.forEach(function(b){var d=b.foldedFrom?(state.days[b.foldedFrom]||{}):r;var key=b.foldedFrom?b.foldedBlockId:b.i;var v=(d.checks||{})[key];if(v===true)done++;});
  return {blocks:work,done:done,total:work.length};
}

/* v14.4.4: recovery stays calm. A single small miss is not automatically turned
   into another task; the offer appears only when there is a meaningful recent
   pattern (2+ affected days) or at least 60 minutes of missed study. The engine
   still chooses the target, but the UI explains why the signal crossed the threshold. */
/* v14.4.2: recovery remains bounded, adds signal-to-noise filtering and makes the
   chosen recovery target explicit. Small misses stay invisible rather than becoming
   another task on an already protected day. */
/* v14.4.1: recovery remains bounded, but now has a clear lifecycle.
   A recovery offer is shown at most once per day; completing, stopping, or
   dismissing it prevents the same offer from nagging the user repeatedly. */
function smRecoveryStatus(date){
  var x=state.recoveryLog&&state.recoveryLog[date];
  return x&&x.status?x.status:null;
}
function smRecoverySummary(date){
  var out=[], days=0, totalMins=0;
  for(var k=1;k<=7;k++){
    var d=new Date(date+'T12:00:00'); d.setDate(d.getDate()-k);
    var iso=d.toISOString().slice(0,10), e=plan.byDate[iso], r=recFor(iso);
    if(!e) continue;
    var ts=smSimpleTodayStats(e,iso,r);
    var missed=0, mins=0;
    (ts.blocks||[]).forEach(function(b){
      var bd=b.foldedFrom?(state.days[b.foldedFrom]||{}):r;
      var key=b.foldedFrom?b.foldedBlockId:b.i;
      if((bd.checks||{})[key]!==true){ missed++; mins+=Math.max(15,Number(b.mins)||30); }
    });
    if(missed){ days++; totalMins+=mins; out.push({date:iso,missed:missed,mins:mins}); }
  }
  return {days:days,totalMins:totalMins,items:out};
}
function smTodayRecoveryTarget(date,ad){
  var topics=[];
  try{ topics=smAdaptiveTopics(date)||[]; }catch(e){ topics=[]; }
  /* Recovery is still a Today decision: when a repair signal exists, prefer
     the most defensible repair target rather than allowing the generic adaptive
     learner to drift back to broad new learning. Ties remain deterministic. */
  var repair=topics.filter(function(t){return t.repair||t.recentMiss||t.confidentWrong;}).sort(function(a,b){
    return (Number(b.repair)-Number(a.repair)) || (Number(b.confidentWrong)-Number(a.confidentWrong)) ||
      (Number(b.retentionRisk||0)-Number(a.retentionRisk||0)) || (Number(b.due||0)-Number(a.due||0)) ||
      ((a.name||'').localeCompare(b.name||''));
  })[0];
  if(repair) return {target:repair,action:repair.repair||repair.recentMiss||repair.confidentWrong?'repair':(ad.action||'retrieve'),reason:'Today is using the strongest repair signal before opening new learning.'};
  return {target:ad.target||{},action:ad.action||'retrieve',reason:'Today is using current retention and mastery evidence to choose the bridge back.'};
}
function smRecoveryChoice(date){
  if(smRecoveryStatus(date)) return null;
  var rs=smRecoverySummary(date);
  if(!rs.days || (rs.days<2 && rs.totalMins<60)) return null;
  var ad=smAdaptiveDecision(date,30,false), picked=smTodayRecoveryTarget(date,ad), t=picked.target||{};
  var action=picked.action||'retrieve';
  var source=rs.items.slice().sort(function(a,b){return (b.mins-a.mins)||(b.date.localeCompare(a.date));})[0]||{};
  var signal=rs.days>=2?'a repeated recent miss pattern':(rs.totalMins+' minutes of recent missed study');
  var engineReason=(ad.reason&&ad.reason.length)?ad.reason.join(' · '):picked.reason;
  return {summary:rs, topic:t.name||'your highest-value weak topic', topicId:t.i, action:action, sourceDate:source.date, sourceMinutes:source.mins, signal:signal, reason:engineReason, bridgeReason:picked.reason};
}

function smTodayPrimaryBlock(ts,date){
  if(!ts||!ts.blocks) return null;
  for(var i=0;i<ts.blocks.length;i++){
    var b=ts.blocks[i], bd=b.foldedFrom?(state.days[b.foldedFrom]||{}):null, key=b.foldedFrom?b.foldedBlockId:b.i;
    var checks=(bd||{}).checks||((state.days[date]||{}).checks||{});
    if(checks[key]!==true) return {block:b,index:i,label:b.label||'Next scheduled block',mins:Number(b.mins)||30,type:b.kind||'planned'};
  }
  return null;
}

/* v14.4.8: Today is the single director. When a scheduled block remains, repair
   is an overlay on that block rather than a competing destination. Repair and retrieval signals are folded into this unfinished Today block; the same
   decision object is used by the card and the session start handler, so the
   user sees one recommendation and then receives that exact recommendation. */
function smTodayBridge(date,entry,r){
  var ts=smSimpleTodayStats(entry,date,r), anchor=smTodayPrimaryBlock(ts,date), ad=smAdaptiveDecision(date,30,false);
  var recovery=smRecoveryChoice(date), repairTotal=0, due=0;
  try{ repairTotal=SM.repairSets(state.scores,state.repairs,Date.now(),capDays(),4).total||0; }catch(e){}
  try{ due=(SM.dueQueue(state.misses,Date.now(),60).queue||[]).length; }catch(e){}
  if(anchor){
    var topicId=anchor.block&&(anchor.block.ti!=null?anchor.block.ti:(anchor.block.topicId!=null?anchor.block.topicId:null));
    var target=ad.target||{}, overlay='planned';
    /* Only call it a repair overlay when the evidence points at the same
       scheduled topic. Otherwise preserve the campaign block and merely use
       retrieval/repair technique inside it. */
    if(topicId!=null && target.i!=null && Number(topicId)===Number(target.i) &&
       (ad.action==='repair'||ad.action==='recall'||ad.action==='retrieve')) overlay=ad.action;
    return {mode:'today',anchor:anchor,overlay:overlay,target:target,ad:ad,recovery:null,
      label:anchor.label||'Next scheduled block',reason:overlay==='repair'?'Repair evidence points to this scheduled topic.':
        overlay==='recall'||overlay==='retrieve'?'Today keeps the scheduled block and uses retrieval evidence inside it.':
        'Today stays anchored to the campaign; adaptive evidence shapes the method, not the topic; the schedule remains the anchor.',
      signals:(ts.total-ts.done)+' block'+(ts.total-ts.done===1?'':'s')+' remaining'};
  }
  if(recovery) return {mode:'recovery',anchor:null,overlay:'recovery',target:recovery,recovery:recovery,ad:ad,
    label:recovery.topic,reason:recovery.bridgeReason,signals:recovery.summary.days+' recent miss'+(recovery.summary.days===1?'':'es')};
  return {mode:(repairTotal||due)?'practice':'today',anchor:null,overlay:(repairTotal?'repair':'retrieve'),target:ad.target||{},recovery:null,
    label:(ad.target&&ad.target.name)||'the next useful topic',reason:(repairTotal||due)?'Today is clear, so the next block can absorb the strongest repair/retrieval signal.':'The campaign is clear here; use the next evidence-aware move.',
    signals:(due?due+' due item'+(due===1?'':'s'):'')+(due&&repairTotal?' · ':'')+(repairTotal?repairTotal+' repair set'+(repairTotal===1?'':'s'):'')};
}

function smTodayIntelligence(date,entry,r){
  var ts=smSimpleTodayStats(entry,date,r), repairTotal=0, due=0;
  try{ repairTotal=SM.repairSets(state.scores,state.repairs,Date.now(),capDays(),4).total||0; }catch(e){}
  try{ due=(SM.dueQueue(state.misses,Date.now(),60).queue||[]).length; }catch(e){}
  var bridge=smTodayBridge(date,entry,r), recovery=bridge.recovery, ad=bridge.ad, t=ad.target||{}, primaryBlock=bridge.anchor;
  var action=ad.action||'learn', label=t.name||'the next useful topic';
  var primary='today', button='Start next block →', kicker='TODAY · INTELLIGENT NEXT STEP', note='The normal plan stays in charge.';
  if(bridge.mode==='today'){
    /* The schedule anchors Today. Adaptive evidence changes the method only. */
    if(primaryBlock) label=primaryBlock.label;
    action=bridge.overlay;
    note=bridge.reason;
    kicker='TODAY · '+(bridge.overlay==='repair'?'REPAIR INSIDE TODAY':bridge.overlay==='retrieve'||bridge.overlay==='recall'?'RETRIEVAL INSIDE TODAY':'SCHEDULE ANCHOR');
  } else if(recovery){
    primary='recovery'; kicker='TODAY · RECOVERY + REPAIR'; button='Do one '+Math.min(30,recovery.summary.totalMins)+'-min recovery block →';
    note='The recovery block is the bridge between missed work and today — bounded, optional, and never added as catch-up debt. '+recovery.bridgeReason;
    label=recovery.topic; action=recovery.action;
  } else if(repairTotal||due){
    primary='repair'; kicker='TODAY · REPAIR + RETRIEVAL';
    note='Today has no unfinished campaign block, so the engine can use this space for repair/retrieval instead of creating extra catch-up work.';
  }
  var actionLabel=ts.total>ts.done?'Today':(action==='retrieve'||action==='recall'?'Retrieve':action==='repair'?'Repair':action==='retain'?'Retention':'Learn');
  var signals=[];
  if(ts.total>ts.done) signals.push((ts.total-ts.done)+' today block'+(ts.total-ts.done===1?'':'s')+' remaining');
  if(due) signals.push(due+' due retrieval item'+(due===1?'':'s'));
  if(repairTotal) signals.push(repairTotal+' repair set'+(repairTotal===1?'':'s'));
  if(recovery) signals.push(recovery.summary.days+' recent miss'+(recovery.summary.days===1?'':'es'));
  return {primary:primary,button:button,kicker:kicker,note:note,label:label,action:action,actionLabel:actionLabel,anchor:primaryBlock,signals:signals,recovery:recovery,ts:ts,repairTotal:repairTotal,due:due,reason:(ad.reason||[]).join(' · ')||'Based on your recent study evidence.'};
}

/* The four renderers that lived here (renderToday, renderStudy, renderPractice,
   renderProgressTab) plus renderSimpleQuickLog were the v13.2.4 simplified
   presentation layer. They were never executed: identically-named functions in
   ui-learning, ui-practice-progress and ui-render-ai are declared later in the
   same scope and win hoisting, so these were ~100 lines of unreachable duplicate
   UI shadowed by the live v14.4/v15 screens. Removed rather than revived,
   because reviving them would silently downgrade Today, Learn, Practice and
   Progress to their pre-v14 form. The helpers above and renderMore below are
   live and stay. */

function renderMore(){
  return smSimpleHeader('MORE','Tools & support','Less-frequent actions live here. Pick one thing, then use the back control to return.')+
    '<div class="dm24-more-group"><div class="dm24-section-title">Study</div><div class="dm24-more-list">'+
    '<button type="button" data-go-tab="study"><b>Learn</b><span>Open phases, topics and lectures</span></button>'+
    '<button type="button" data-go-tab="log"><b>Log an MCQ</b><span>Record a question without leaving the study flow</span></button>'+
    '<button type="button" data-go-tab="plan"><b>Plan</b><span>Inspect or change the campaign</span></button>'+
    '</div></div>'+
    '<div class="dm24-more-group"><div class="dm24-section-title">App</div><div class="dm24-more-list">'+
    '<button type="button" data-go-tab="settings"><b>Setup</b><span>Modes, exam date, reminders and backup</span></button>'+
    '<button type="button" data-go-tab="help"><b>Help & feedback</b><span>Learn the workflow and send structured feedback</span></button>'+
    '<button type="button" data-go-tab="ai"><b>AI tools</b><span>Optional study support and handoff prompts</span></button>'+
    '</div></div>'+
    '<div class="dm24-more-tip">Tip: <b>Today</b> tells you what to do now; <b>Practice</b> handles questions; <b>Progress</b> shows the signal.</div>';
}
