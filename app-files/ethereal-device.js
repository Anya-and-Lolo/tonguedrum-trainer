/* Device diagnostics for opted-in cloud saves. No IP, location service or fingerprint. */
(function(){
 'use strict';
 const RELEASE='r35';
 const clean=(v,n=100)=>String(v||'').replace(/[\u0000-\u001f]/g,' ').slice(0,n);
 function describe(env){
  const n=env.navigator||{},s=env.screen||{},ua=String(n.userAgent||''),hints=env.hints||{},forms=hints.formFactors||[];
  const short=Math.min(Number(s.width)||Infinity,Number(s.height)||Infinity);
  const ipad=/iPad/.test(ua)||(/Macintosh/.test(ua)&&n.maxTouchPoints>1);
  const android=/Android/.test(ua);
  const type=forms.includes('Tablet')||ipad||(android&&(!/Mobile/.test(ua)||short>=600))?'tablet':forms.includes('Mobile')||/iPhone|iPod/.test(ua)||(android&&/Mobile/.test(ua))?'phone':'computer';
  const os=ipad||/iPhone|iPod/.test(ua)?'iOS / iPadOS':android?'Android':/Windows/.test(ua)?'Windows':/CrOS/.test(ua)?'ChromeOS':/Mac/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'Unknown';
  const match=ua.match(/(Edg|EdgiOS|EdgA)\/([\d.]+)/)||ua.match(/(OPR)\/([\d.]+)/)||ua.match(/(Firefox|FxiOS)\/([\d.]+)/)||ua.match(/(Chrome|CriOS)\/([\d.]+)/)||ua.match(/(Version)\/([\d.]+)/),names={Edg:'Edge',EdgiOS:'Edge',EdgA:'Edge',OPR:'Opera',Version:'Safari',CriOS:'Chrome',FxiOS:'Firefox'};
  return {type,os,browser:match?`${names[match[1]]||match[1]} ${match[2].split('.')[0]}`:'Unknown',model:clean(hints.model,80),
   language:clean(env.language||'en',12),browserLanguage:clean(n.language,24),width:Math.round(env.width||0),height:Math.round(env.height||0),
   screenWidth:Math.round(s.width||0),screenHeight:Math.round(s.height||0),dpr:Math.round((env.dpr||1)*100)/100,
   touch:Boolean(n.maxTouchPoints>0),installed:Boolean(env.installed),release:RELEASE};
 }
 function merge(...maps){
  const out={};
  for(const map of maps)for(const [id,v] of Object.entries(map||{})){
   if(!/^[\w-]{1,100}$/.test(id)||!v||typeof v!=='object')continue;
   const a=out[id];if(!a){out[id]={...v};continue;}
   const b=Number(v.lastSeen)>Number(a.lastSeen)?v:a;
   const positive=values=>values.map(Number).filter(n=>Number.isFinite(n)&&n>0);
   out[id]={...a,...v,...b,firstSeen:positive([a.firstSeen,v.firstSeen,a.lastSeen,v.lastSeen]).length?Math.min(...positive([a.firstSeen,v.firstSeen,a.lastSeen,v.lastSeen])):0,lastSeen:Math.max(Number(a.lastSeen)||0,Number(v.lastSeen)||0),
    minWidth:positive([a.minWidth,v.minWidth,a.width,v.width]).length?Math.min(...positive([a.minWidth,v.minWidth,a.width,v.width])):0,maxWidth:Math.max(0,...positive([a.maxWidth,v.maxWidth,a.width,v.width])),
    languages:[...new Set([...(a.languages||[]),...(v.languages||[]),a.language,v.language].filter(Boolean))],
    sizes:[...new Set([...(a.sizes||[]),...(v.sizes||[])])].slice(-12)};
  }
  return Object.fromEntries(Object.entries(out).sort((a,b)=>(b[1].lastSeen||0)-(a[1].lastSeen||0)).slice(0,50));
 }
 let hints={};
 async function enrich(){
  try {if(navigator.userAgentData?.getHighEntropyValues)hints=await navigator.userAgentData.getHighEntropyValues(['model','formFactors']);}catch{}
 }
 function snapshot({id,language,previous}){
  const installed=['standalone','fullscreen','minimal-ui'].some(mode=>window.matchMedia?.(`(display-mode: ${mode})`).matches)||navigator.standalone===true;
  const v=describe({navigator,screen:window.screen,width:window.innerWidth,height:window.innerHeight,dpr:window.devicePixelRatio,language,installed,hints});
  const now=Date.now();v.firstSeen=now;v.lastSeen=now;v.minWidth=v.width;v.maxWidth=v.width;v.languages=[v.language];v.sizes=[`${v.width} x ${v.height}`];
  return merge(previous,{[id]:v});
 }
 window.EtherealDevice={RELEASE,describe,merge,enrich,snapshot};
})();
