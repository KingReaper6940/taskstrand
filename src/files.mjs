import {validatePlan,formatPlan} from './plan.mjs';import {compareScenario} from './scenario.mjs';
export function makeProject(plan,taskId='',extraMinutes=0){plan=validatePlan(plan);formatPlan(plan);compareScenario(plan,taskId,extraMinutes);return {schema:'taskstrand-project-v1',plan,adjustment:{taskId,extraMinutes}};}
export function parseProject(text){
 if(typeof text!=='string'||text.length>60000)throw new Error('Project JSON must be at most 60,000 text units.');
 let value;try{value=JSON.parse(text);}catch{throw new Error('Could not read project JSON. Current work was preserved.');}
 if(!value||value.schema!=='taskstrand-project-v1'||!value.adjustment||typeof value.adjustment.taskId!=='string'||!Number.isInteger(value.adjustment.extraMinutes)||Object.keys(value).some(k=>!['schema','plan','adjustment'].includes(k))||Object.keys(value.adjustment).some(k=>!['taskId','extraMinutes'].includes(k)))throw new Error('Expected a Taskstrand v1 project with plan and adjustment.');
 return makeProject(value.plan,value.adjustment.taskId,value.adjustment.extraMinutes);
}
export const jsonReport=state=>JSON.stringify({schema:'taskstrand-report-v1',unit:'elapsed minutes',plan:state.plan,...state.result},null,2)+'\n';
function fence(text){let longest=2;for(const match of text.matchAll(/`+/g))longest=Math.max(longest,match[0].length);const mark='`'.repeat(longest+1);return mark+'text\n'+text+'\n'+mark;}
export function markdownReport(state){
 const out=['# Taskstrand','',state.result.baseline.scope,'','Baseline finish: '+state.result.baseline.makespan+' minutes. Scenario finish: '+state.result.scenario.makespan+' minutes. Shift: +'+state.result.finishDelta+' minutes.','',fence('Plan: '+state.plan.title+'\nOverrun task: '+(state.result.adjustment.taskId||'(none)')+'\nExtra minutes: '+state.result.adjustment.extraMinutes),''];
 for(const key of ['baseline','scenario']){const schedule=state.result[key];out.push('## '+key,'',fence('One representative longest chain: '+schedule.representativeChain.join(' → ')+'\nAll zero-slack task IDs: '+schedule.criticalIDs.join(', ')+'\n\n'+schedule.rows.map(row=>row.id+' | '+row.label+' | duration '+row.minutes+' | needs '+(row.needs.join(',')||'none')+' | early '+row.earliestStart+'–'+row.earliestFinish+' | late '+row.latestStart+'–'+row.latestFinish+' | total slack '+row.slack).join('\n')),'');}
 out.push('## Earliest timing differences','',fence(state.result.taskChanges.map(row=>row.id+' | start Δ '+row.startDelta+' | finish Δ '+row.finishDelta+' | total slack Δ '+row.slackDelta).join('\n')),'');
 return out.join('\n');
}
