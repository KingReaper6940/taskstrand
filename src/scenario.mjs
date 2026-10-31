import {schedule} from './schedule.mjs';
export function compareScenario(plan,taskId='',extraMinutes=0){
 if(typeof taskId!=='string'||!Number.isInteger(extraMinutes)||extraMinutes<0||extraMinutes>1440)throw new Error('Overrun must use a task ID and an integer from 0 to 1,440 extra minutes.');
 if(taskId&&!plan.tasks.some(t=>t.id===taskId))throw new Error('Overrun task ID is not in this plan.');
 if(extraMinutes&&!taskId)throw new Error('Choose a task for the overrun.');
 const adjustment={taskId:taskId||null,extraMinutes},baseline=schedule(plan),scenario=schedule(plan,adjustment),old=new Map(baseline.rows.map(row=>[row.id,row]));
 return {baseline,scenario,adjustment,finishDelta:scenario.makespan-baseline.makespan,taskChanges:scenario.rows.map(row=>({id:row.id,startDelta:row.earliestStart-old.get(row.id).earliestStart,finishDelta:row.earliestFinish-old.get(row.id).earliestFinish,slackDelta:row.slack-old.get(row.id).slack}))};
}
