/* Dakshinamurthy v17 — 30-minute adaptive focus experience.
   Presentation layer over the existing SurgiMaster curriculum/data engine.
   No network, no question-stem fabrication. */
(function(){
'use strict';
var SM=window.SM, KEY='dakshinamurthy:v17-focus';
var app=document.getElementById('app');
if(!app||!SM) return;

var state=load();
var timer=null, view='home', pendingWhy=false, pendingChange=false;

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]});}
function now(){return Date.now();}
function dayKey(){var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function save(){state.updatedAt=now();try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
function load(){try{var x=JSON.parse(localStorage.getItem(KEY)||'null');if(x&&typeof x==='object')return normalize(x);}catch(e){}return normalize({});}
function normalize(s){
 s=s||{}; s.day=s.day||{}; if(s.day.date!==dayKey())s.day={date:dayKey(),blocks:0,planned:0,completed:0,reflection:[],lastTopic:null};
 s.tasks=s.tasks||{}; s.topics=s.topics||{}; s.overrides=Array.isArray(s.overrides)?s.overrides:[]; s.deferred=Array.isArray(s.deferred)?s.deferred:[];
 s.queue=Array.isArray(s.queue)?s.queue:[]; s.current=s.current||null; s.lastResult=s.lastResult||null; s.tomorrow=s.tomorrow||null; s.breakUntil=Number(s.breakUntil)||0;
 return s;
}
function topic(ti){return SM.CURRICULUM[ti]||null;}
function tiProgress(ti){
 var t=topic(ti), it=SM.topicItems(ti), z=state.topics[ti]||{};
 var lecTotal=(it.l||[]).length, bankTotal=(it.b||[]).length, speedTotal=(it.s||[]).length;
 var lecDone=Number(z.lecDone)||0, bankQ=Number(z.bankQ)||0, speedQ=Number(z.speedQ)||0;
 var total=(t&&t.lecmin?1:0)+(t&&t.dtq?1:0)+(t&&t.spq?1:0);
 var done=(lecDone>0?1:0)+(bankQ>0?1:0)+(speedQ>0?1:0);
 return {pct:total?Math.round(done/total*100):0,lecDone:lecDone,lecTotal:lecTotal,bankQ:bankQ,bankTotal:Number(t&&t.dtq)||0,speedQ:speedQ,speedTotal:Number(t&&t.spq)||0};
}
function accuracy(ti){var z=state.topics[ti]||{}, n=Number(z.attempts)||0; return n?Number(z.correct||0)/n:null;}
function confidenceAvg(ti){var z=state.topics[ti]||{},a=Array.isArray(z.conf)?z.conf:[];return a.length?a.reduce(function(x,y){return x+Number(y||0)},0)/a.length:null;}
function overdue(ti){var z=state.topics[ti]||{};return !!z.reviewDue;}
function candidates(){
 var a=[];
 SM.CURRICULUM.forEach(function(t){
   var p=tiProgress(t.i), acc=accuracy(t.i), conf=confidenceAvg(t.i), z=state.topics[t.i]||{};
   var score=0;
   if(overdue(t.i))score+=40;
   if(acc!=null)score+=(1-acc)*35;
   if(conf!=null && acc!=null && conf/5>acc)score+=20;
   score+=(100-p.pct)*.18;
   if(z.repeatMisses)score+=Math.min(20,Number(z.repeatMisses)*4);
   if(!z.started)score+=4;
   a.push({ti:t.i,t:t,p:p,acc:acc,conf:conf,score:score});
 });
 return a.sort(function(x,y){return y.score-x.score});
}
function sourcesFor(ti){
 var it=SM.topicItems(ti), out=[];
 (it.l||[]).forEach(function(x,i){out.push({id:'l-'+ti+'-'+i,type:'lecture',title:x[0],mins:Number(x[1])||0,path:x[2]});});
 (it.b||[]).forEach(function(x,i){out.push({id:'b-'+ti+'-'+i,type:'bank',title:x[0],count:Number(x[1])||0,path:x[2]});});
 (it.s||[]).forEach(function(x,i){out.push({id:'s-'+ti+'-'+i,type:'speed',title:x[0],count:Number(x[1])||0,mins:Number(x[3])||0,path:x[2]});});
 return out;
}
function taskFor(ti,prefer){
 var arr=sourcesFor(ti); if(!arr.length)return null;
 var pref=arr.filter(function(x){return x.type===prefer});
 var z=state.topics[ti]||{};
 var done=pref.filter(function(x){return state.tasks[x.id]&&state.tasks[x.id].done;});
 return (pref.filter(function(x){return !(state.tasks[x.id]&&state.tasks[x.id].done);})[0]||pref[0]||arr.filter(function(x){return !(state.tasks[x.id]&&state.tasks[x.id].done);})[0]||arr[0]);
}
function recommend(){
 if(state.deferred.length){
   var d=state.deferred[0], c=candidates().find(function(x){return x.ti===d.ti;});
   if(c&&c.score>35)return {ti:d.ti,task:taskFor(d.ti,d.prefer||'bank'),reason:'This deferred task is relevant again.',deferred:true};
 }
 var c=candidates()[0]||{ti:0};
 var pref=overdue(c.ti)?'bank':(c.acc!=null&&c.acc<.7?'bank':'lecture');
 return {ti:c.ti,task:taskFor(c.ti,pref),reason:overdue(c.ti)?'Retrieval is due.':(c.acc!=null&&c.acc<.7?'Recent MCQ accuracy is below target.':'This topic has the most useful available work right now.')};
}
function goalText(r){var t=topic(r.ti),q=r.task;if(!t||!q)return 'Choose a study task'; if(q.type==='lecture')return 'Complete one lecture segment from '+t.n; if(q.type==='bank')return 'Complete a focused DocTutorials MCQ set from '+t.n; return 'Complete a timed Speed MCQ set from '+t.n;}
function effort(q){if(!q)return '~30 min'; if(q.type==='lecture')return '~30 min focused lecture'; if(q.type==='speed')return '~30 min timed retrieval'; return '~30 min MCQs + review';}
function labelTask(q){if(!q)return '';return q.type==='lecture'?'Lecture':q.type==='bank'?'DocTutorials MCQ':'Speed MCQ';}
function currentRec(){return state.current&&state.current.rec?state.current.rec:recommend();}
function start(rec){
 var t=topic(rec.ti); if(!t||!rec.task)return;
 var key=rec.task.id; state.current={startedAt:now(),elapsed:0,rec:rec,goal:goalText(rec),taskId:key,progress:0,questions:0,notes:'',lastSave:now()};
 state.day.planned=Math.max(Number(state.day.planned)||0,Number(state.day.blocks||0)+1); save(); view='block'; render(); beginTimer();
}
function beginTimer(){clearInterval(timer);timer=setInterval(function(){if(!state.current)return;state.current.elapsed=now()-state.current.startedAt;state.current.lastSave=now();try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}updateTimer();},1000);}
function updateTimer(){var e=document.getElementById('v17Timer');if(!e||!state.current)return;var sec=Math.max(0,Math.floor(state.current.elapsed/1000));e.textContent=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');}
function stopTimer(){clearInterval(timer);timer=null;}
function beforeAfter(ti){var p=tiProgress(ti), z=state.topics[ti]||{};return {before:Number(z.beforeSnapshot!=null?z.beforeSnapshot:p.pct),after:p.pct};}
function completeBlock(){if(!state.current)return;stopTimer();state.current.progress=100;state.current.completedAt=now();state.lastResult={ti:state.current.rec.ti,taskId:state.current.taskId};state.day.blocks=(Number(state.day.blocks)||0)+1;state.day.completed=(Number(state.day.completed)||0)+1;state.day.lastTopic=state.current.rec.ti;view='confidence';save();render();}
function setProgress(v){if(!state.current)return;v=Math.max(0,Math.min(100,Number(v)||0));state.current.progress=v; if(v>=100)completeBlock();else{save();render();}}
function updateTopicFromBlock(){
 var c=state.current, ti=c.rec.ti, q=c.rec.task, z=state.topics[ti]||(state.topics[ti]={}); z.started=true;
 if(q.type==='lecture'){z.lecDone=(Number(z.lecDone)||0)+1;}
 if(q.type==='bank'){z.bankQ=(Number(z.bankQ)||0)+Math.max(1,Number(c.questions)||0);z.attempts=(Number(z.attempts)||0)+Math.max(1,Number(c.questions)||0);z.correct=(Number(z.correct)||0)+Math.max(0,Math.round((Number(c.correct)||0)));}
 if(q.type==='speed'){z.speedQ=(Number(z.speedQ)||0)+Math.max(1,Number(c.questions)||0);z.attempts=(Number(z.attempts)||0)+Math.max(1,Number(c.questions)||0);z.correct=(Number(z.correct)||0)+Math.max(0,Math.round((Number(c.correct)||0)));}
 z.reviewDue=false;
}
function confidenceSave(v){var ti=state.current.rec.ti,z=state.topics[ti]||(state.topics[ti]={});z.conf=z.conf||[];z.conf.push(Number(v));if(z.conf.length>12)z.conf.shift();
 updateTopicFromBlock(); var ba=beforeAfter(ti);state.lastResult.before=ba.before;state.lastResult.after=ba.after;state.lastResult.change=ba.after-ba.before;state.lastResult.confidence=Number(v);state.current=null;state.day.lastTopic=ti;save();view='result';render();}
function deferCurrent(reason){if(!state.current)return;var r=state.current.rec;state.deferred.push({ti:r.ti,prefer:r.task&&r.task.type,reason:reason||'Not now',at:now()});state.current=null;save();view='home';render();}
function recordOverride(reason){var r=currentRec();state.overrides.push({at:now(),ti:r.ti,task:r.task&&r.task.id,reason:String(reason||'Not specified')});if(state.overrides.length>100)state.overrides.shift();save();}
function nextAfterResult(){var r=recommend();if(r.deferred){state.deferred.shift();save();view='deferAsk';render();}else{view='next';render();}}
function breakSuggestion(){return state.day.blocks>=3?'Rest your eyes and take a short walk.':'Stand up, hydrate, and reset for the next block.';}
function fmtPct(x){return x==null?'—':Math.round(x*100)+'%';}
function render(){
 var r=currentRec(),t=topic(r.ti),p=t?tiProgress(t.i):{pct:0};
 document.title='Dakshinamurthy — 30-minute adaptive study';
 app.innerHTML=(view==='block'?blockHTML():view==='confidence'?confidenceHTML():view==='result'?resultHTML():view==='next'?nextHTML():view==='break'?breakHTML():view==='change'?changeHTML():view==='why'?whyHTML():view==='deferAsk'?deferHTML():homeHTML());
 if(view==='block')beginTimer();else stopTimer();
 wire();
}
function shell(title,sub,body){return '<div class="v17-shell"><header class="v17-head"><div><div class="v17-brand">ॐ Dakshinamurthy</div><h1>'+esc(title)+'</h1><p>'+esc(sub)+'</p></div><div class="v17-badge">30 min</div></header>'+body+'</div>';}
function homeHTML(){var r=recommend(),t=topic(r.ti),p=t?tiProgress(t.i):null,acc=t?accuracy(t.i):null,done=state.day.blocks||0;return shell('Today','One clear goal. One block. The app chooses the next useful step.',
 '<section class="v17-card hero"><div class="eyebrow">NEXT RECOMMENDATION</div><h2>'+esc(goalText(r))+'</h2><div class="taskmeta"><span>'+esc(labelTask(r.task))+'</span><span>'+esc(effort(r.task))+'</span></div><p class="whyline">'+esc(r.reason)+'</p><div class="progressrow"><span>Topic progress</span><strong>'+p.pct+'%</strong></div><div class="bar"><i style="width:'+p.pct+'%"></i></div><div class="actions"><button class="primary" data-start>Start Next</button><button data-break>Take a Break</button><button class="textbtn" data-why>Why this?</button></div></section>'+
 '<section class="v17-card"><div class="eyebrow">TODAY</div><div class="todaybig">'+done+' block'+(done===1?'':'s')+' completed</div><p class="muted">Block-based progress · '+(state.day.completed||0)+' fully completed today.</p></section>'+
 '<section class="v17-card"><div class="eyebrow">TOPIC</div><h3>'+esc(t.n)+'</h3><p class="muted">MCQ accuracy: '+fmtPct(acc)+' · Confidence: '+(confidenceAvg(t.i)==null?'—':confidenceAvg(t.i).toFixed(1)+'/5')+'</p><button data-change>Change task</button></section>');}
function blockHTML(){var c=state.current,r=c.rec,t=topic(r.ti),p=tiProgress(r.ti),pct=Math.round(c.progress||0);return shell('Focus block',t.n,
 '<section class="v17-card focus"><div class="eyebrow">ONE GOAL</div><h2>'+esc(c.goal)+'</h2><p class="muted">Source: '+esc(labelTask(r.task))+' · '+esc(r.task.title)+'</p><div class="timer" id="v17Timer">0:00</div><div class="bar large"><i style="width:'+pct+'%"></i></div><div class="progressrow"><span>Block progress</span><strong>'+pct+'%</strong></div>'+
 '<div class="progresscontrols"><button data-p="25">25%</button><button data-p="50">50%</button><button data-p="75">75%</button><button data-p="100">Complete</button></div>'+ (r.task.type==='bank'||r.task.type==='speed'?'<div class="qgrid"><label>Questions attempted<input id="v17Q" type="number" min="0" inputmode="numeric" value="'+(c.questions||'')+'"></label><label>Correct<input id="v17C" type="number" min="0" inputmode="numeric" value="'+(c.correct||'')+'"></label></div>':'')+
 '<p class="autosave">Live saved · If you leave, this block resumes automatically at '+pct+'%.</p></section>');}
function confidenceHTML(){return shell('Block complete','One last input before the app decides what comes next.', '<section class="v17-card center"><div class="check">✓</div><h2>Nice. Block complete.</h2><p class="muted">Rate how confident you feel about what you just worked on.</p><div class="confgrid">'+[1,2,3,4,5].map(function(n){return '<button data-conf="'+n+'"><b>'+n+'</b><span>'+['Very low','Low','Moderate','High','Very high'][n-1]+'</span></button>';}).join('')+'</div></section>');}
function resultHTML(){var x=state.lastResult||{},t=topic(x.ti),c=state.topics[x.ti]||{};return shell('Block result','Your progress is saved.', '<section class="v17-card"><div class="eyebrow">BEFORE → AFTER → CHANGE</div><div class="compare"><div><small>Before</small><strong>'+x.before+'%</strong></div><div>→</div><div><small>After</small><strong>'+x.after+'%</strong></div><div>→</div><div><small>Change</small><strong>+'+x.change+'%</strong></div></div><p><b>'+esc(t.n)+'</b> · Confidence '+x.confidence+'/5</p><div class="actions"><button class="primary" data-next>Start Next</button><button data-break>Take a Break</button></div></section>');}
function nextHTML(){var r=recommend(),t=topic(r.ti);return shell('Next block','The adaptive queue is ready.', '<section class="v17-card hero"><div class="eyebrow">RECOMMENDED</div><h2>'+esc(goalText(r))+'</h2><p>'+esc(r.reason)+'</p><div class="taskmeta"><span>'+esc(labelTask(r.task))+'</span><span>'+esc(effort(r.task))+'</span></div><div class="actions"><button class="primary" data-start>Start Next</button><button data-change>Change</button></div></section>');}
function breakHTML(){var left=Math.max(0,Math.ceil((state.breakUntil-now())/1000));return shell('Break','Adaptive recovery based on your recent workload.', '<section class="v17-card center"><div class="timer smalltimer" id="v17Break">'+left+'s</div><h2>'+esc(breakSuggestion())+'</h2><p class="muted">No fixed time-of-day rule. The suggestion is based on recent activity.</p><div class="actions"><button class="primary" data-skipbreak>Skip break</button></div></section>');}
function changeHTML(){var r=recommend(),c=candidates(),rows=c.slice(0,12).map(function(x){var q=taskFor(x.ti,x.acc!=null&&x.acc<.7?'bank':'lecture');return '<button class="taskchoice" data-pick="'+x.ti+'"><span><b>'+esc(x.t.n)+'</b><small>'+esc(q?labelTask(q):'No mapped activity')+' · '+esc(q?q.title:'')+'</small></span><em>'+esc(x.overdue?'Overdue':(x.acc!=null?'Accuracy '+fmtPct(x.acc):'New'))+'</em></button>';}).join('');return shell('Choose another task','Available tasks are shown with their current benefit.', '<section class="v17-card"><div class="eyebrow">RECOMMENDED FIRST</div><button class="taskchoice featured" data-pick="'+r.ti+'"><span><b>'+esc(r.t.n)+'</b><small>'+esc(goalText(r))+' · '+esc(effort(r.task))+'</small></span><em>Recommended</em></button><div class="listtitle">Other available topics</div>'+rows+'</section>');}
function whyHTML(){var r=currentRec(),t=topic(r.ti),x=candidates().find(function(a){return a.ti===r.ti})||{},a=accuracy(r.ti),conf=confidenceAvg(r.ti);return shell('Why this?','Detailed reasoning is available only when you ask for it.', '<section class="v17-card"><h2>'+esc(goalText(r))+'</h2><ul class="whylist"><li>MCQ accuracy: <b>'+fmtPct(a)+'</b></li><li>Confidence calibration: <b>'+(a!=null&&conf!=null?(conf/5>a?'Needs attention':'Aligned'):'Not enough data')+'</b></li><li>Retrieval status: <b>'+(overdue(r.ti)?'Due':'Not due')+'</b></li><li>Topic progress: <b>'+tiProgress(r.ti).pct+'%</b></li><li>Reason: <b>'+esc(r.reason)+'</b></li></ul><h3>What would change this recommendation?</h3><p>Higher MCQ accuracy, a cleared retrieval due item, better confidence calibration, or a newly available mapped activity could change the next task.</p><div class="actions"><button data-change>Change my mind</button><button data-start>Keep this</button></div></section>');}
function deferHTML(){var r=recommend();return shell('Deferred task is relevant again','The app asks before bringing it back.', '<section class="v17-card"><div class="eyebrow">WHY NOW?</div><h2>'+esc(goalText(r))+'</h2><p>'+esc(r.reason)+'</p><div class="taskmeta"><span>Benefit: '+esc(r.deferred?'Retrieval risk is rising again.':'Adaptive priority')+'</span><span>'+esc(effort(r.task))+'</span></div><div class="actions"><button class="primary" data-bring>Bring it back</button><button data-notnow>Not now</button></div></section>');}
function wire(){
 document.querySelectorAll('[data-start]').forEach(function(b){b.onclick=function(){start(recommend());};});
 document.querySelectorAll('[data-next]').forEach(function(b){b.onclick=function(){nextAfterResult();};});
 document.querySelectorAll('[data-change]').forEach(function(b){b.onclick=function(){view='change';render();};});
 document.querySelectorAll('[data-why]').forEach(function(b){b.onclick=function(){view='why';render();};});
 document.querySelectorAll('[data-break]').forEach(function(b){b.onclick=function(){state.breakUntil=now()+Math.min(300000,Math.max(60000,(Number(state.day.blocks)||0)>2?300000:180000));save();view='break';render();breakTick();};});
 document.querySelectorAll('[data-skipbreak]').forEach(function(b){b.onclick=function(){state.breakUntil=0;save();view='next';render();};});
 document.querySelectorAll('[data-p]').forEach(function(b){b.onclick=function(){var q=document.getElementById('v17Q'),c=document.getElementById('v17C');if(q)state.current.questions=Number(q.value)||0;if(c)state.current.correct=Number(c.value)||0;setProgress(Number(b.dataset.p));};});
 document.querySelectorAll('[data-conf]').forEach(function(b){b.onclick=function(){confidenceSave(Number(b.dataset.conf));};});
 document.querySelectorAll('[data-pick]').forEach(function(b){b.onclick=function(){var ti=Number(b.dataset.pick),q=taskFor(ti,(accuracy(ti)!=null&&accuracy(ti)<.7)?'bank':'lecture');if(!q)return;var old=recommend();var reason=prompt('Why are you overriding the recommendation?');recordOverride(reason||'Not specified');start({ti:ti,task:q,reason:'You chose this task.'});};});
 var q=document.getElementById('v17Q');if(q)q.oninput=function(){if(state.current){state.current.questions=Number(q.value)||0;state.current.lastSave=now();save();}};
 var c=document.getElementById('v17C');if(c)c.oninput=function(){if(state.current){state.current.correct=Number(c.value)||0;state.current.lastSave=now();save();}};
 if(view==='break')breakTick();
}
function breakTick(){var iv=setInterval(function(){var e=document.getElementById('v17Break');if(!e){clearInterval(iv);return;}var left=Math.max(0,Math.ceil((state.breakUntil-now())/1000));e.textContent=left+'s';if(left<=0){clearInterval(iv);state.breakUntil=0;save();view='next';render();}},1000);}

/* Resume unfinished work automatically. */
if(state.current){view='block';}
else view='home';
render();
})();
