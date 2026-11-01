/* Ethereal: shared, offline English / Russian / Simplified Chinese UI. */
(function () {
  'use strict';
  const KEY='ethereal-language-v1', supported=['en','ru','zh-CN','es','ja','ar'];
  let language='ru';
  try { const saved=localStorage.getItem(KEY); if(supported.includes(saved))language=saved; } catch {}
  const phrases=window.EtherealTranslations||[];
  const normalise=s=>String(s??'').replace(/[\u2013\u2014]/g,'-').replace(/\s+/g,' ').trim();
  const exact=new Map(), rules=[], cache=new Map();
  const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  for(const row of phrases) {
    const key=normalise(row[0]);
    if(/\{\d+\}/.test(key)) {
      const slots=[];let last=0,pattern='';
      const numeric=/^\{\d+\} (?:notes|notes total|strokes|strokes total|bars|beats|tongues|stars|days in a row|min|min ago|shared notes|shared pitches|h \{\d+\} min|of \{\d+\})$/i.test(key);
      const countFirst=/^\{\d+\}(?:-note| (?:of |notes\b|strokes\b|bars\b|beats\b|tongues\b|stars\b|days\b|min\b|h |shared ))/i.test(key);
      for(const m of key.matchAll(/\{(\d+)\}/g)){pattern+=escape(key.slice(last,m.index))+((numeric||(m.index===0&&countFirst))?'([\\d\\u0660-\\u0669\\u06f0-\\u06f9.,\\s\\u066b\\u066c]+?)':'(.*?)');slots.push(m[1]);last=m.index+m[0].length;}
      pattern+=escape(key.slice(last));rules.push({re:new RegExp('^'+pattern+'$','i'),slots,row,specific:key.replace(/\{\d+\}/g,'').length});
    } else exact.set(key.toLocaleLowerCase(),row);
  }
  rules.sort((a,b)=>b.specific-a.specific);
  function translate(value,depth=0) {
    const source=String(value??''), text=normalise(source), index=supported.indexOf(language);
    if(!index)return source.replace(/[\u2013\u2014]/g,'-');
    if(!text)return source;
    const key=language+'|'+text;
    if(cache.has(key))return source.replace(source.trim(),cache.get(key));
    let result=exact.get(text.toLocaleLowerCase())?.[index];
    if(result===undefined && depth<4)for(const rule of rules){if((text.includes(' · ')&&!rule.row[0].includes(' · '))||(text.includes(' or ')&&/^Unlock \{/.test(rule.row[0])))continue;const match=text.match(rule.re);if(!match)continue;const values={};rule.slots.forEach((n,i)=>values[n]=translate(match[i+1],depth+1));result=(rule.row[index]||rule.row[0]).replace(/\{(\d+)\}/g,(_,n)=>values[n]??'');break;}
    if(result===undefined&&depth<4){
      for(const [separator,join] of [[' · ',' · '],[' or ',({ru:' или ','zh-CN':'或',es:' o ',ja:' または ',ar:' أو '})[language] || ' or ']]){
        if(!text.includes(separator))continue;
        const parts=text.split(separator),translated=parts.map(part=>translate(part,depth+1));
        if(translated.some((part,i)=>part!==parts[i])){result=translated.join(join);break;}
      }
    }
    if(result===undefined){
      // Inline icons and punctuation are separate text nodes in many controls.
      const m=text.match(/^([✓▶❚❚■↔✨🔊❄🔆♫·+\s]*)(.+?)([.!:?…·\s]*)$/u);
      const row=m&&exact.get(m[2].toLocaleLowerCase());
      result=row?m[1]+row[index]+m[3]:text;
    }
    cache.set(key,result);return source.replace(source.trim(),result);
  }
  const originals=new WeakMap(), attributes=new WeakMap();
  const excluded='script,style,textarea,code,pre,[translate="no"],[data-no-i18n],.lyrics,.lyric-text,.timing-lyric-print,.tongue-face,#printSheet';
  function textNode(node){
    if(!node.parentElement||node.parentElement.closest(excluded))return;
    let record=originals.get(node);
    if(!record||node.nodeValue!==record.last)record={source:node.nodeValue,last:node.nodeValue};
    const countLabel=node.parentElement.classList.contains('stat-pill') && /^\s*notes\s*$/i.test(record.source);
    const next=countLabel && language!=='en'?record.source.replace(record.source.trim(),translate('Notes left')):translate(record.source);record.last=next;originals.set(node,record);
    if(node.nodeValue!==next)node.nodeValue=next;
  }
  function element(node){
    if(node.matches(excluded)||node.closest('[translate="no"],[data-no-i18n]'))return;
    let records=attributes.get(node)||{};
    for(const attr of ['title','placeholder','aria-label','data-hint','alt'])if(node.hasAttribute(attr)){
      const value=node.getAttribute(attr);let record=records[attr];
      if(!record||value!==record.last)record={source:value,last:value};
      const next=translate(record.source);record.last=next;records[attr]=record;if(value!==next)node.setAttribute(attr,next);
    }
    attributes.set(node,records);
  }
  function render(root=document.body){
    if(!root)return;if(root.nodeType===3){textNode(root);return;}
    if(root.nodeType!==1)return;
    element(root);const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){const n=walker.currentNode;if(n.nodeType===3)textNode(n);else element(n);}
  }
  let observer;
  function observe(){observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','placeholder','aria-label','data-hint','alt']});const title=document.querySelector('title');if(title)observer.observe(title,{childList:true,characterData:true,subtree:true});}
  function setLanguage(locale,persist=true){
    if(!supported.includes(locale))return;language=locale;cache.clear();
    if(persist)try{localStorage.setItem(KEY,locale);}catch{}
    if(typeof document!=='undefined'){
      document.documentElement.lang=locale;document.documentElement.dir=locale==='ar'?'rtl':'ltr';
      if(document.body){observer?.disconnect();render();const title=document.querySelector('title');if(title)render(title);document.querySelectorAll('.language-select').forEach(select=>{select.value=locale;select.setAttribute('aria-label',translate('Interface language'));const control=select.closest('.language-control');if(control){control.querySelector('.language-code').textContent=({en:'ENG',ru:'RUS','zh-CN':'ZHO',es:'SPA',ja:'JPN',ar:'ARA'})[locale];control.title=translate('Interface language');}});if(observer)observe();}
      window.dispatchEvent?.(new CustomEvent('ethereal-languagechange',{detail:{language:locale}}));
    }
  }
  function start(){
    const actions=document.querySelector('.top-actions');
    if(actions&&!actions.querySelector('.language-control')){
      const label=document.createElement('label');label.className='language-control';
      label.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h12M8 3v2M5 5c0 6 4 9 9 10M12 5c0 6-4 9-9 11M14 21l4-11 4 11M15.5 17h5"/></svg><b class="language-code" aria-hidden="true" translate="no"></b><select class="language-select" aria-label="Interface language" translate="no"><option value="en">English</option><option value="ru">Русский</option><option value="zh-CN">简体中文</option><option value="es">Español</option><option value="ja">日本語</option><option value="ar">العربية</option></select>';
      actions.prepend(label);label.querySelector('select').addEventListener('change',event=>setLanguage(event.target.value));
    }
    observer=new MutationObserver(records=>{observer.disconnect();const roots=new Set();for(const record of records){if(record.type==='childList')record.addedNodes.forEach(node=>roots.add(node));else roots.add(record.target);}roots.forEach(render);observe();});
    setLanguage(language,false);
    window.addEventListener('storage',event=>{if(event.key===KEY&&supported.includes(event.newValue))setLanguage(event.newValue,false);});
    // Browser dialogs and canvas feedback do not participate in the DOM.
    for(const method of ['alert','confirm','prompt']){const native=window[method]?.bind(window);if(native)window[method]=(message,...args)=>native(translate(message),...args);}
    if(typeof CanvasRenderingContext2D!=='undefined'){
      const native=CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText=function(text,...args){return native.call(this,translate(text),...args);};
    }
  }
  window.EtherealI18n={t:translate,setLanguage,normalise,get language(){return language;},supported,phrases};
  if(typeof document!=='undefined'){document.documentElement.lang=language;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();}
})();
