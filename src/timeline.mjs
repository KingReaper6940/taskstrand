const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&apos;");
function short(value){const chars=[...value];return chars.length>30?chars.slice(0,29).join('')+'…':value;}
export function renderTimeline(schedule,view='scenario'){
 const width=1100,height=145+schedule.rows.length*44,left=255,span=635,total=Math.max(1,schedule.makespan);
 const x=value=>left+value/total*span,n=value=>Number(value.toFixed(3));
 const out=['<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'" role="img" aria-labelledby="title description">',
 '<title id="title">'+escape(schedule.title)+' — '+escape(view)+' earliest-start timeline</title>',
 '<desc id="description">Elapsed minutes, unlimited parallel capacity. Solid bars are earliest work; outlined tails show total slack, not independently spendable free time. Labels may be shortened; full labels and values are in the report and table.</desc>',
 '<rect width="1100" height="'+height+'" fill="#fbfaf7"/>',
 '<text x="25" y="32" font-family="monospace" font-size="18" fill="#233248">'+escape(short(schedule.title))+' · '+escape(view)+'</text>',
 '<text x="25" y="58" font-family="monospace" font-size="12" fill="#536175">Critical = orange; other work = blue; outlined tail = total slack</text>'];
 const steps=schedule.makespan===0?0:4;
 for(let i=0;i<=steps;i++){const time=steps?schedule.makespan*i/steps:0,px=n(x(time));out.push('<line x1="'+px+'" y1="85" x2="'+px+'" y2="'+(height-40)+'" stroke="#dbe1e7"/>','<text x="'+px+'" y="80" font-size="11" font-family="monospace" fill="#536175">'+time+'m</text>');}
 schedule.rows.forEach((row,i)=>{const y=105+i*44,start=n(x(row.earliestStart)),finish=n(x(row.earliestFinish)),latest=n(x(row.latestFinish)),color=row.critical?'#ac432d':'#325a88';
  out.push('<g><title>'+escape(row.id+' — '+row.label+'; start '+row.earliestStart+', finish '+row.earliestFinish+', total slack '+row.slack+' minutes')+'</title>',
   '<text x="25" y="'+(y+14)+'" font-family="monospace" font-size="12" fill="#233248">'+escape(short(row.id+' · '+row.label))+'</text>');
  if(row.slack>0)out.push('<rect x="'+finish+'" y="'+y+'" width="'+n(latest-finish)+'" height="20" fill="none" stroke="#536175" stroke-dasharray="3 3"/>');
  if(row.minutes===0)out.push('<path d="M '+start+' '+(y-1)+' l 7 11 l -7 11 l -7 -11 Z" fill="'+color+'"/>');
  else out.push('<rect x="'+start+'" y="'+y+'" width="'+n(finish-start)+'" height="20" rx="3" fill="'+color+'"/>');
  out.push('<text x="915" y="'+(y+14)+'" font-family="monospace" font-size="11" fill="#233248">'+row.earliestStart+'–'+row.earliestFinish+'m · slack '+row.slack+'</text></g>');
 });
 out.push('<text x="25" y="'+(height-14)+'" font-family="monospace" font-size="11" fill="#536175">Precedence lower bound only. No staffing, calendars or resource limits.</text></svg>');
 return out.join('\n')+'\n';
}
