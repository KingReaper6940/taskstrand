export const LIMITS=Object.freeze({units:30000,tasks:60,predecessors:8,duration:1440});
export class PlanError extends Error{constructor(issues){super(issues[0]?.message||'Invalid plan.');this.name='PlanError';this.issues=issues;}}
const idPattern=/^[A-Za-z][A-Za-z0-9_-]{0,19}$/;
const printable=value=>typeof value==='string'&&value.length>0&&value.length<=80&&value.trim()===value&&!/[\p{Cc}\p{Cf}\p{Cs}\u2028\u2029]/u.test(value);
const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
export const compareID=(a,b)=>a<b?-1:a>b?1:0;
export function validatePlan(value){
 const issues=[],add=(task,field,message)=>issues.push({task,field,message});
 if(!object(value))throw new PlanError([{task:null,field:'plan',message:'Expected a plan object with title and tasks.'}]);
 for(const key of Object.keys(value))if(!['title','tasks'].includes(key))add(null,key,'Unknown plan field: '+key+'.');
 if(!printable(value.title))add(null,'title','Title must be 1–80 printable text units without edge whitespace.');
 if(!Array.isArray(value.tasks)||value.tasks.length<1||value.tasks.length>LIMITS.tasks)add(null,'tasks','Use 1–60 tasks.');
 if(issues.length)throw new PlanError(issues);
 const ids=new Set();
 value.tasks.forEach((task,i)=>{
  const row=i+1;
  if(!object(task)){add(row,'task','Task '+row+' must be an object.');return;}
  for(const key of Object.keys(task))if(!['id','label','minutes','needs'].includes(key))add(row,key,'Task '+row+' has unknown field '+key+'.');
  if(typeof task.id!=='string'||!idPattern.test(task.id))add(row,'id','Task '+row+': ID must begin with a letter, then letters/digits/_/-; maximum 20 characters.');
  else if(ids.has(task.id))add(row,'id','Repeated task ID: '+task.id+'.');else ids.add(task.id);
  if(!printable(task.label))add(row,'label','Task '+row+': label must be 1–80 printable units without edge whitespace.');
  if(!Number.isInteger(task.minutes)||task.minutes<0||task.minutes>LIMITS.duration)add(row,'minutes','Task '+row+': minutes must be an integer from 0 to 1,440.');
  if(!Array.isArray(task.needs)||task.needs.length>LIMITS.predecessors||task.needs.some(id=>typeof id!=='string'||!idPattern.test(id)))add(row,'needs','Task '+row+': needs must contain up to 8 valid ID strings.');
  else if(new Set(task.needs).size!==task.needs.length)add(row,'needs','Task '+row+' repeats a predecessor.');
 });
 if(issues.length)throw new PlanError(issues);
 value.tasks.forEach((task,i)=>{for(const id of task.needs)if(!ids.has(id))add(i+1,'needs','Task '+task.id+' refers to missing predecessor '+id+'.');});
 if(issues.length)throw new PlanError(issues);
 return {title:value.title,tasks:value.tasks.map(t=>({id:t.id,label:t.label,minutes:t.minutes,needs:[...t.needs]}))};
}
export function parsePlan(text){if(typeof text!=='string'||text.length>LIMITS.units)throw new PlanError([{task:null,field:'source',message:'Plan JSON must be at most 30,000 text units.'}]);let value;try{value=JSON.parse(text);}catch{throw new PlanError([{task:null,field:'source',message:'Could not parse plan JSON. Check quotes, commas and brackets.'}]);}return validatePlan(value);}

export function formatPlan(value){const plan=validatePlan(value),pretty=JSON.stringify(plan,null,2);if(pretty.length<=LIMITS.units)return pretty;const compact=JSON.stringify(plan);if(compact.length>LIMITS.units)throw new PlanError([{task:null,field:'source',message:'Formatted plan exceeds the source limit.'}]);return compact;}
