import {makeProject,parseProject,jsonReport,markdownReport} from './files.mjs';import {formatPlan} from './plan.mjs';import {renderTimeline} from './timeline.mjs';
const $=id=>document.getElementById(id);
export function installHandoff({getCurrent,calculate}){
 let urls=[],revision=0,request=0;
 function release(){for(const value of urls)URL.revokeObjectURL(value);urls=[];}
 function url(text,type){const value=URL.createObjectURL(new Blob([text],{type}));urls.push(value);return value;}
 document.addEventListener('taskstrand:clear',()=>{revision++;release();});
 document.addEventListener('taskstrand:ready',()=>{const state=getCurrent();if(!state)return;
  const files=[['JSON report','taskstrand-report.json',jsonReport(state),'application/json'],['Markdown brief','taskstrand.md',markdownReport(state),'text/markdown'],['Baseline SVG','taskstrand-baseline.svg',renderTimeline(state.result.baseline,'baseline'),'image/svg+xml'],['Scenario SVG','taskstrand-scenario.svg',renderTimeline(state.result.scenario,'scenario'),'image/svg+xml']];
  for(const [label,name,text,type]of files){const a=document.createElement('a');a.textContent=label;a.download=name;a.href=url(text,type);$('downloads').append(a);}$('save-project').disabled=false;
 });
 $('save-project').addEventListener('click',()=>{const state=getCurrent();if(!state)return;try{const {taskId,extraMinutes}=state.result.adjustment,project=makeProject(state.plan,taskId||'',extraMinutes),a=document.createElement('a');a.download='taskstrand-project.json';a.href=url(JSON.stringify(project,null,2)+'\n','application/json');document.body.append(a);a.click();a.remove();$('file-status').textContent='Project download requested. It contains the baseline plan and overrun settings.';}catch(error){$('file-status').textContent=error.message;}});
 $('open-project').addEventListener('change',async()=>{const file=$('open-project').files?.[0];if(!file)return;const version=revision,token=++request;
  try{if(file.size>200000)throw new Error('Use a project file up to 200,000 bytes.');let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer());}catch{throw new Error('Could not decode this project as UTF-8. Current work was preserved.');}
   const project=parseProject(text),source=formatPlan(project.plan);
   if(version!==revision||token!==request)throw new Error('Work changed while loading. Current work was preserved; open again to replace it.');
   $('source').value=source;$('delay-task').value=project.adjustment.taskId;$('delay-minutes').value=project.adjustment.extraMinutes;$('view').value='scenario';$('filter').value='all';calculate();$('file-status').textContent='Project opened. Baseline plan and overrun restored.';
  }catch(error){$('file-status').textContent=error.message;}finally{$('open-project').value='';}
 });
 globalThis.addEventListener('pagehide',release);
}
