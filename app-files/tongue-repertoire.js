/* Musical labels always resolve to real tongues. Source scores remain unchanged. */
(function(){
 'use strict';
 const base=s=>String(s).normalize('NFD').replace(/[\u0307\u0323]/g,'');
 const labels=instrument=>[...instrument.notes].sort((a,b)=>a.midi-b.midi).map(n=>String(n.label));
 function adaptiveSequence(kind,instrument){
  const l=labels(instrument), n=l.length;
  const rounds=n<=6?8:n<=8?6:n<=11?4:3;
  const step=notes=>notes.join(' ')+' 0:2 | ';
  if(kind==='pulse')return Array.from({length:6},(_,i)=>i<3?`${l[0]} 0:3 |`:`${l[0]} 0 ${l[0]} 0 |`).join(' ');
  if(kind==='scale')return Array.from({length:rounds},()=>step(l)+step([...l].reverse())).join(' ');
  if(kind==='echo')return Array.from({length:4},()=>l.map((x,i)=>`${x} ${l[Math.min(n-1,i+1)]} ${x} 0 |`).join(' ')).join(' ');
  if(kind==='pairs')return Array.from({length:4},()=>l.map(x=>`${x} ${x} 0 0 |`).join(' ')).join(' ');
  if(kind==='bells')return Array.from({length:6},()=>step([l[0],l[Math.floor(n/2)],l[n-1],l[Math.floor(n/2)],l[0]])).join(' ');
  if(kind==='ghost')return Array.from({length:8},()=>`${l[0]} 0 ${l[2]} 0 | ${l[n-1]} ${l[Math.floor(n/2)]} 0:2 |`).join(' ');
  return '';
 }
 function adapt(song,instrument){
  if(!song||!instrument)return song;
  const kind=song.exercise || (['01-note-scale-practice','02-15-note-scale-practice'].includes(song.id)?'scale':'');
  if(kind)return {...song,sequence:adaptiveSequence(kind,instrument),adapted:true};
  if(!song.octaveAdapt)return song;
  const l=labels(instrument), available=new Set(l);
  const sequence=song.sequence.split(/(\s+)/).map(token=>{
   const [core,...duration]=token.split(':');
   const mapped=[...new Set(core.split('+').map(label=>available.has(label)?label:(l.find(x=>base(x)===base(label))||label)))].join('+');
   return mapped+(duration.length?':'+duration.join(':'):'');
  }).join('');
  return {...song,sequence,adapted:sequence!==song.sequence};
 }
 function compatible(song,instrument){
  if(!song||!instrument)return false;
  if(song.minTongues && instrument.notes.length<song.minTongues)return false;
  const available=new Set(labels(instrument));
  return adapt(song,instrument).sequence.split(/\s+/).flatMap(t=>t.split(':')[0].split('+')).filter(t=>/^[1-7]/.test(t)).every(t=>available.has(t));
 }
 function season(date=new Date()){
  const m=date.getMonth(),d=date.getDate();
  return m===11||(m===0&&d<=15)?'winter':m===9?'halloween':'';
 }
 // Chinese-calendar windows recur three times each year. Stable route keys keep progress.
 function lanternFestival(date=new Date()){
  try{
   const parts=new Intl.DateTimeFormat('en-u-ca-chinese',{month:'numeric',day:'numeric'}).formatToParts(date);
   const month=parts.find(p=>p.type==='month')?.value||'',day=Number(parts.find(p=>p.type==='day')?.value);
   if(!/^\d+$/.test(month))return ''; // A leap month is not the named festival month.
   const m=Number(month);
   return m===1&&day<=15?'new-year':m===5&&day<=7?'dragon-boat':m===8&&day>=8&&day<=22?'mid-autumn':'';
  }catch{return '';}
 }
 function available(song,date=new Date()){
  return !song?.festival || (song.festival==='winter'?season(date)==='winter':song.festival==='lanterns'?Boolean(lanternFestival(date)):false);
 }
 function paths(original,songs,instrument,date=new Date()){
  const S=(id,title,level='easy',key)=>({type:'song',id,title,level,...(key?{key}:{})});
  const B=(id,title,reward,rewardName,key)=>({type:'boss',id,title,level:'medium',stars:3,speed:.75,reward,rewardName,key});
  const lookup=id=>songs.find(s=>s.id===id);
  const fits=n=>n.type==='drill'||compatible(lookup(n.id),instrument);
  const result=original.map(p=>({...p,nodes:p.nodes.map((n,i)=>({...n,key:`${p.id}-${i}`})).filter(fits)}));
  // Every instrument starts with a full up/down exploration, then a small phrase and echo.
  result[0].nodes=[S('01-note-scale-practice','Note Scale Practice','easy','p1-0'),S('19-find-your-pulse','Find your pulse','easy','p1-pulse'),S('20-note-echo','Note echo','easy','p1-echo'),...result[0].nodes.filter(n=>n.id!=='01-note-scale-practice')];
  const lamb=result[0].nodes.find(n=>n.type==='song'&&n.id==='07-mary-had-a-little-lamb');
  if(lamb){result[0].nodes=result[0].nodes.filter(n=>n!==lamb);result[0].nodes.splice(3,0,lamb);}
  for(const [i,p] of result.entries()){
   if(!p.nodes.some(n=>n.type==='boss'))p.nodes.push(B(i===0?'20-note-echo':i===1?'21-paired-notes':'22-bell-garden',i===0?'Note echo':i===1?'Paired notes':'Bell garden',i===0?'silver':i===1?'gold':'obsidian',i===0?'Silver drum':i===1?'Gold drum':'Obsidian & gold drum',`${p.id}-adaptive-trial`));
   if(p.nodes.length<4)p.nodes.unshift(S(i===1?'21-paired-notes':'22-bell-garden',i===1?'Paired notes':'Bell garden'));
  }
  if(instrument.notes.length>=11){
   const nodes=[S('23-la-vie-en-rose','La Vie en Rose','medium'),S('24-minuet-in-g','Minuet in G Major','medium'),S('25-yao-dance','The Dance of the Yao People','hard'),S('26-never-ending-story','The NeverEnding Story','hard'),S('27-animal-crossing-rainy','Animal Crossing: 9 A.M. Rainy','medium'),S('28-axel-f-study','Axel F: motif study','medium'),S('29-thoi-khong-sai-lech','Thời Không Sai Lệch','hard'),B('27-animal-crossing-rainy','Animal Crossing: 9 A.M. Rainy','nebula','Nebula','p4-trial')].filter(fits);
   if(nodes.length)result.push({id:'p4',name:'Beyond the horizon',nodes});
  }
  // Additional video arrangements keep their IDs when collections return.
  const studyNode=song=>S(song.id,song.title,'medium',`study-${song.id}`);
  for(const song of songs.filter(song=>song.videoStudy&&song.pathPlacement&&available(song,date))){
   const path=result.find(p=>p.id===`p${song.pathPlacement}`);
   if(!path||!compatible(song,instrument))continue;
   const before=path.nodes.findIndex(n=>n.type==='boss');path.nodes.splice(before<0?path.nodes.length:before,0,studyNode(song));
  }
  const baby=lookup('video-circle-51');
  if(baby&&compatible(baby,instrument))result[0].nodes.splice(4,0,studyNode(baby));
  const japan=songs.filter(song=>song.videoStudy&&song.collection==='japan'&&compatible(song,instrument));
  if(japan.length){
   const nodes=[S('10-sakura-sakura','Sakura Sakura','easy','japan-sakura'),...japan.map(studyNode)].filter(fits);
   const last=nodes.at(-1);nodes.push(B(last.id,last.title,'sakura-porcelain','Sakura porcelain','japan-trial'));
   result.push({id:'japan',name:'Japanese skies',optional:true,nodes});
  }
  const lanterns=songs.filter(song=>song.festival==='lanterns'&&compatible(song,instrument));
  if(lanternFestival(date)&&lanterns.length){
   const nodes=lanterns.map(studyNode),last=nodes.at(-1);
   nodes.push(B(last.id,last.title,'jade-lantern','Jade lantern','lanterns-trial'));
   result.push({id:'lanterns',name:'Lantern melodies',optional:true,nodes});
  }
  const active=season(date);
  if(active==='winter'){
   const nodes=[S('22-bell-garden','Bell garden'),S('community-let-it-snow','Let It Snow','medium'),S('community-last-christmas','Last Christmas','medium'),S('community-feliz-navidad','Feliz Navidad','medium')].filter(fits);
   nodes.push(...songs.filter(song=>song.videoStudy&&song.festival==='winter'&&compatible(song,instrument)).map(studyNode));
   const last=nodes[nodes.length-1];nodes.push(B(last.id,last.title,'winter-bell','Winter bell','winter-trial'));
   result.push({id:'winter',name:'Winter lights',optional:true,nodes});
  }
  if(active==='halloween')result.push({id:'halloween',name:'Ghost notes',optional:true,nodes:[S('30-ghost-notes','Ghost notes'),S('21-paired-notes','Paired notes'),B('30-ghost-notes','Ghost notes','harvest-moon','Harvest moon','halloween-trial')]});
  return result;
 }
 window.EtherealTongueRepertoire={adapt,compatible,adaptiveSequence,season,lanternFestival,available,paths};
})();
