import {validatePlan,compareID} from './plan.mjs';
export class CycleError extends Error{constructor(cycle){super('Dependency cycle: '+cycle.join(' → ')+'.');this.name='CycleError';this.cycle=cycle;}}
function cycleWitness(ids,successors){
 const state=new Map(),path=[];let result=null;
 function visit(id){state.set(id,1);path.push(id);for(const next of successors.get(id)){if(state.get(next)===1){result=path.slice(path.indexOf(next)).concat(next);return;}if(!state.has(next)){visit(next);if(result)return;}}path.pop();state.set(id,2);}
 for(const id of ids)if(!state.has(id)){visit(id);if(result)return result;}
 throw new Error('Could not locate cycle witness.');
}
export function schedule(input,adjustment={taskId:null,extraMinutes:0}){
 const plan=validatePlan(input);
 if(!adjustment||(adjustment.taskId!==null&&typeof adjustment.taskId!=='string')||!Number.isInteger(adjustment.extraMinutes)||adjustment.extraMinutes<0||adjustment.extraMinutes>1440||(!adjustment.taskId&&adjustment.extraMinutes)||adjustment.taskId&&!plan.tasks.some(t=>t.id===adjustment.taskId))throw new Error('Invalid duration adjustment.');
 const tasks=new Map(plan.tasks.map(t=>[t.id,t])),ids=[...tasks.keys()].sort(compareID),successors=new Map(ids.map(id=>[id,[]])),remaining=new Map(ids.map(id=>[id,tasks.get(id).needs.length]));
 for(const task of tasks.values())for(const predecessor of task.needs)successors.get(predecessor).push(task.id);
 for(const values of successors.values())values.sort(compareID);
 const ready=ids.filter(id=>remaining.get(id)===0),order=[];
 while(ready.length){ready.sort(compareID);const id=ready.shift();order.push(id);for(const next of successors.get(id)){remaining.set(next,remaining.get(next)-1);if(remaining.get(next)===0)ready.push(next);}}
 if(order.length!==ids.length)throw new CycleError(cycleWitness(ids,successors));
 const rows=new Map(),parent=new Map();
 for(const id of order){
  const task=tasks.get(id),needs=[...task.needs].sort(compareID),earliestStart=Math.max(0,...needs.map(dep=>rows.get(dep).earliestFinish));
  parent.set(id,needs.find(dep=>rows.get(dep).earliestFinish===earliestStart)??null);
  const minutes=task.minutes+(id===adjustment.taskId?adjustment.extraMinutes:0);
  rows.set(id,{...task,minutes,needs,earliestStart,earliestFinish:earliestStart+minutes});
 }
 const makespan=Math.max(...[...rows.values()].map(row=>row.earliestFinish));
 for(const id of [...order].reverse()){
  const row=rows.get(id),next=successors.get(id);row.latestFinish=next.length?Math.min(...next.map(nextID=>rows.get(nextID).latestStart)):makespan;
  row.latestStart=row.latestFinish-row.minutes;row.slack=row.latestStart-row.earliestStart;row.critical=row.slack===0;
 }
 const sink=ids.find(id=>successors.get(id).length===0&&rows.get(id).earliestFinish===makespan),representativeChain=[];
 for(let id=sink;id!==null&&id!==undefined;id=parent.get(id))representativeChain.unshift(id);
 return {title:plan.title,makespan,order,rows:order.map(id=>rows.get(id)),criticalIDs:order.filter(id=>rows.get(id).critical),representativeChain,
  scope:'Elapsed-minute finish-to-start precedence model with unlimited parallel capacity. No staffing, calendars, costs, risk or execution guarantee.'};
}
