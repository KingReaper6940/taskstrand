import {installHandoff} from './handoff.mjs';
import {parsePlan,validatePlan,formatPlan} from './plan.mjs';import {compareScenario} from './scenario.mjs';import {renderTimeline} from './timeline.mjs';import {EXAMPLE} from './example.mjs';
const $=id=>document.getElementById(id);let current=null;
export const getCurrent=()=>current;
export function clear(){document.dispatchEvent(new CustomEvent('taskstrand:clear'));current=null;$('results').hidden=true;$('errors').hidden=true;$('downloads').replaceChildren();$('timeline').replaceChildren();$('save-project').disabled=true;$('status').textContent='Inputs changed. Calculate again to refresh results.';}
const node=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;return e;};
export function renderView(){
 if(!current)return;
 const view=$('view').value,selected=current.result[view],changes=new Map(current.result.taskChanges.map(row=>[row.id,row]));
 const svg=new DOMParser().parseFromString(renderTimeline(selected,view),'image/svg+xml').documentElement;$('timeline').replaceChildren(document.importNode(svg,true));
 $('critical-chain').textContent=selected.representativeChain.join(' → ');$('critical-count').textContent=selected.criticalIDs.length+' zero-slack tasks across all critical paths. The chain above is one deterministic example.';
 $('table-caption').textContent=view+' · elapsed minutes; deltas always compare scenario against baseline';$('task-rows').replaceChildren();
 const rows=selected.rows.filter(row=>$('filter').value==='all'||$('filter').value==='critical'&&row.critical||$('filter').value==='moved'&&(changes.get(row.id).startDelta||changes.get(row.id).finishDelta));
 for(const row of rows){const tr=node('tr'),task=node('td'),change=changes.get(row.id);task.append(node('strong',row.id),node('small',row.label));if(row.critical){const badge=node('span','critical');badge.className='critical-tag';task.append(badge);}tr.append(task);
  for(const value of [row.minutes,row.needs.join(', ')||'—',row.earliestStart,row.earliestFinish,row.latestStart,row.latestFinish,row.slack,change.startDelta,change.finishDelta])tr.append(node('td',String(value)));$('task-rows').append(tr);}
 $('table-count').textContent=rows.length+' of '+selected.rows.length+' tasks shown. Timeline and exports always include all tasks.';
}
export function readExtra(){const value=$('delay-minutes').value;if(value.trim()==='')throw new Error('Enter an explicit extra-minute value, including 0 for no change.');return Number(value);}
export function calculate(){
 clear();$('error-list').replaceChildren();
 try{const plan=parsePlan($('source').value),taskId=$('delay-task').value.trim(),extraMinutes=readExtra(),result=compareScenario(plan,taskId,extraMinutes);current={plan,result};
  $('results').hidden=false;$('plan-title').textContent=plan.title;$('scenario-note').textContent=extraMinutes?'Task '+taskId+' takes '+extraMinutes+' extra minutes; baseline source is unchanged.':'No additional duration applied.';
  $('baseline-finish').textContent=result.baseline.makespan;$('scenario-finish').textContent=result.scenario.makespan;$('finish-delta').textContent='+'+result.finishDelta;
  $('status').textContent='Comparison ready under the unlimited-capacity precedence model.';renderView();document.dispatchEvent(new CustomEvent('taskstrand:ready'));
 }catch(error){clear();$('errors').hidden=false;const messages=error.issues?error.issues.map(issue=>(issue.task?'Task row '+issue.task+' · ':'')+issue.field+' · '+issue.message):[error.message];for(const message of messages)$('error-list').append(node('li',message));$('status').textContent='Plan needs attention. All schedules and exports are blocked.';}
}
for(const id of ['source','delay-task','delay-minutes'])$(id).addEventListener('input',clear);
for(const id of ['view','filter'])$(id).addEventListener('change',renderView);
$('calculate').addEventListener('click',calculate);
$('add-task').addEventListener('click',()=>{
 try{const plan=parsePlan($('source').value),value=$('add-minutes').value;if(!value.trim())throw new Error('Enter task minutes, including 0 for a milestone.');
 const next=validatePlan({...plan,tasks:[...plan.tasks,{id:$('add-id').value.trim(),label:$('add-label').value.trim(),minutes:Number(value),needs:$('add-needs').value.trim()?$('add-needs').value.trim().split(/[,\s]+/):[]}]});
 $('source').value=formatPlan(next);clear();$('add-status').textContent='Task added. Calculate to inspect the revised plan.';
 }catch(error){$('add-status').textContent=error.message;}
});
$('example').addEventListener('click',()=>start());
export function start(){$('source').value=JSON.stringify(EXAMPLE,null,2);$('delay-task').value='C';$('delay-minutes').value='20';$('view').value='scenario';$('filter').value='all';calculate();}
installHandoff({getCurrent,calculate});
start();
