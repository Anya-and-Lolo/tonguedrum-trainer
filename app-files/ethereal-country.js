/* Country preferences for optional cloud saves. Only country codes are retained. */
(function(){
 'use strict';
 const names={"AD":"Andorra","AE":"United Arab Emirates","AF":"Afghanistan","AG":"Antigua & Barbuda","AI":"Anguilla","AL":"Albania","AM":"Armenia","AO":"Angola","AQ":"Antarctica","AR":"Argentina","AS":"American Samoa","AT":"Austria","AU":"Australia","AW":"Aruba","AX":"Åland Islands","AZ":"Azerbaijan","BA":"Bosnia & Herzegovina","BB":"Barbados","BD":"Bangladesh","BE":"Belgium","BF":"Burkina Faso","BG":"Bulgaria","BH":"Bahrain","BI":"Burundi","BJ":"Benin","BL":"St. Barthélemy","BM":"Bermuda","BN":"Brunei","BO":"Bolivia","BQ":"Caribbean Netherlands","BR":"Brazil","BS":"Bahamas","BT":"Bhutan","BV":"Bouvet Island","BW":"Botswana","BY":"Belarus","BZ":"Belize","CA":"Canada","CC":"Cocos (Keeling) Islands","CD":"Congo - Kinshasa","CF":"Central African Republic","CG":"Congo - Brazzaville","CH":"Switzerland","CI":"Côte d’Ivoire","CK":"Cook Islands","CL":"Chile","CM":"Cameroon","CN":"China","CO":"Colombia","CR":"Costa Rica","CU":"Cuba","CV":"Cape Verde","CW":"Curaçao","CX":"Christmas Island","CY":"Cyprus","CZ":"Czechia","DE":"Germany","DJ":"Djibouti","DK":"Denmark","DM":"Dominica","DO":"Dominican Republic","DZ":"Algeria","EC":"Ecuador","EE":"Estonia","EG":"Egypt","EH":"Western Sahara","ER":"Eritrea","ES":"Spain","ET":"Ethiopia","FI":"Finland","FJ":"Fiji","FK":"Falkland Islands","FM":"Micronesia","FO":"Faroe Islands","FR":"France","GA":"Gabon","GB":"United Kingdom","GD":"Grenada","GE":"Georgia","GF":"French Guiana","GG":"Guernsey","GH":"Ghana","GI":"Gibraltar","GL":"Greenland","GM":"Gambia","GN":"Guinea","GP":"Guadeloupe","GQ":"Equatorial Guinea","GR":"Greece","GS":"South Georgia & South Sandwich Islands","GT":"Guatemala","GU":"Guam","GW":"Guinea-Bissau","GY":"Guyana","HK":"Hong Kong SAR China","HM":"Heard Island & McDonald Islands","HN":"Honduras","HR":"Croatia","HT":"Haiti","HU":"Hungary","ID":"Indonesia","IE":"Ireland","IL":"Israel","IM":"Isle of Man","IN":"India","IO":"British Indian Ocean Territory","IQ":"Iraq","IR":"Iran","IS":"Iceland","IT":"Italy","JE":"Jersey","JM":"Jamaica","JO":"Jordan","JP":"Japan","KE":"Kenya","KG":"Kyrgyzstan","KH":"Cambodia","KI":"Kiribati","KM":"Comoros","KN":"St. Kitts & Nevis","KP":"North Korea","KR":"South Korea","KW":"Kuwait","KY":"Cayman Islands","KZ":"Kazakhstan","LA":"Laos","LB":"Lebanon","LC":"St. Lucia","LI":"Liechtenstein","LK":"Sri Lanka","LR":"Liberia","LS":"Lesotho","LT":"Lithuania","LU":"Luxembourg","LV":"Latvia","LY":"Libya","MA":"Morocco","MC":"Monaco","MD":"Moldova","ME":"Montenegro","MF":"St. Martin","MG":"Madagascar","MH":"Marshall Islands","MK":"North Macedonia","ML":"Mali","MM":"Myanmar (Burma)","MN":"Mongolia","MO":"Macao SAR China","MP":"Northern Mariana Islands","MQ":"Martinique","MR":"Mauritania","MS":"Montserrat","MT":"Malta","MU":"Mauritius","MV":"Maldives","MW":"Malawi","MX":"Mexico","MY":"Malaysia","MZ":"Mozambique","NA":"Namibia","NC":"New Caledonia","NE":"Niger","NF":"Norfolk Island","NG":"Nigeria","NI":"Nicaragua","NL":"Netherlands","NO":"Norway","NP":"Nepal","NR":"Nauru","NU":"Niue","NZ":"New Zealand","OM":"Oman","PA":"Panama","PE":"Peru","PF":"French Polynesia","PG":"Papua New Guinea","PH":"Philippines","PK":"Pakistan","PL":"Poland","PM":"St. Pierre & Miquelon","PN":"Pitcairn Islands","PR":"Puerto Rico","PS":"Palestinian Territories","PT":"Portugal","PW":"Palau","PY":"Paraguay","QA":"Qatar","RE":"Réunion","RO":"Romania","RS":"Serbia","RU":"Russia","RW":"Rwanda","SA":"Saudi Arabia","SB":"Solomon Islands","SC":"Seychelles","SD":"Sudan","SE":"Sweden","SG":"Singapore","SH":"St. Helena, Ascension & Tristan da Cunha","SI":"Slovenia","SJ":"Svalbard & Jan Mayen","SK":"Slovakia","SL":"Sierra Leone","SM":"San Marino","SN":"Senegal","SO":"Somalia","SR":"Suriname","SS":"South Sudan","ST":"São Tomé & Príncipe","SV":"El Salvador","SX":"Sint Maarten","SY":"Syria","SZ":"Eswatini","TC":"Turks & Caicos Islands","TD":"Chad","TF":"French Southern and Antarctic Lands","TG":"Togo","TH":"Thailand","TJ":"Tajikistan","TK":"Tokelau","TL":"Timor-Leste","TM":"Turkmenistan","TN":"Tunisia","TO":"Tonga","TR":"Türkiye","TT":"Trinidad & Tobago","TV":"Tuvalu","TW":"Taiwan","TZ":"Tanzania","UA":"Ukraine","UG":"Uganda","UM":"U.S. Outlying Islands","US":"United States","UY":"Uruguay","UZ":"Uzbekistan","VA":"Vatican City","VC":"St. Vincent & Grenadines","VE":"Venezuela","VG":"British Virgin Islands","VI":"U.S. Virgin Islands","VN":"Vietnam","VU":"Vanuatu","WF":"Wallis & Futuna","WS":"Samoa","XK":"Kosovo","YE":"Yemen","YT":"Mayotte","ZA":"South Africa","ZM":"Zambia","ZW":"Zimbabwe"};
 const codes=Object.keys(names), API='https://api.country.is/', CACHE='ethereal-country-ip-v1';
 const stamp=n=>Number.isFinite(Number(n)) && Number(n)>0 && Number(n)<=8640000000000000?Number(n):0;
 function cleanCountry(value){
  if(!value || typeof value!=='object')return null;
  const code=Object.prototype.hasOwnProperty.call(names,String(value.code||'').toUpperCase())?String(value.code).toUpperCase():'';
  const mode=value.mode==='manual' && code?'manual':'auto';
  return {mode,code,source:mode==='manual'?'selected':code?'ip':value.source==='unavailable'?'unavailable':'unknown',preferenceAt:stamp(value.preferenceAt),checkedAt:stamp(value.checkedAt)};
 }
 function mergeCountry(a,b){
  a=cleanCountry(a);b=cleanCountry(b);if(!a)return b;if(!b)return a;
  if(a.preferenceAt!==b.preferenceAt)return a.preferenceAt>b.preferenceAt?a:b;
  if(a.mode!==b.mode)return a.mode==='manual'?a:b;
  return a.checkedAt>b.checkedAt?a:b;
 }
 function choose(code,now=Date.now()){
  return cleanCountry({mode:code?'manual':'auto',code,source:code?'selected':'unknown',preferenceAt:now,checkedAt:code?now:0});
 }
 function name(code,locale='en'){
  if(!Object.prototype.hasOwnProperty.call(names,code))return '';
  try{return new Intl.DisplayNames([locale],{type:'region'}).of(code).replace(/[\u2013\u2014]/g,'-');}catch{return names[code];}
 }
 function options(locale='en'){
  return codes.map(code=>({code,name:name(code,locale)})).sort((a,b)=>a.name.localeCompare(b.name,locale));
 }
 let inflight=null;
 async function estimate({fetcher=fetch,store=localStorage,now=Date.now(),timeout=2500}={}){
  let cached;try{cached=JSON.parse(store.getItem(CACHE)||'null');}catch{}
  if(cached && (cached.code==='' || Object.prototype.hasOwnProperty.call(names,cached.code)) && stamp(cached.at)>0 && stamp(cached.at)<=now && now-stamp(cached.at)<(cached.code?86400000:600000))return {code:cached.code,checkedAt:stamp(cached.at)};
  const controller=new AbortController();let timer;
  try{
   // Promise.race also bounds a fetch implementation that ignores abort (offline proxies).
   const expiry=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(new Error('timeout'));},timeout);});
   const request=(async()=>{const response=await fetcher(API,{method:'GET',cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});if(!response.ok)throw new Error('country unavailable');const value=await response.json();const code=String(value.country||'').toUpperCase();if(!Object.prototype.hasOwnProperty.call(names,code))throw new Error('unknown country');return {code,checkedAt:now};})();
   const result=await Promise.race([request,expiry]);
   try{store.setItem(CACHE,JSON.stringify({code:result.code,at:now}));}catch{}
   return result;
  }catch{
   try{store.setItem(CACHE,JSON.stringify({code:'',at:now}));}catch{}
   return {code:'',checkedAt:now};
  }finally{clearTimeout(timer);}
 }
 async function resolve(value,{allowed=false,...deps}={}){
  const record=cleanCountry(value)||choose('',0);
  if(!allowed || record.mode==='manual')return record;
  if(!inflight)inflight=estimate(deps).finally(()=>{inflight=null;});
  const found=await inflight;
  if(!found.code && record.code)return record; // retain the last known estimate when offline
  return {...record,code:found.code,source:found.code?'ip':'unavailable',checkedAt:found.checkedAt};
 }
 function field(value){
  const record=cleanCountry(value),selected=record?.mode==='manual'?record.code:'';
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const locale=window.EtherealI18n?.language||'en';
  return `<div class="country-preference"><label class="progress-field"><span>Country or region (optional)</span><select data-p="country" data-country-select translate="no" aria-label="${esc(window.EtherealI18n?.t('Country or region (optional)')||'Country or region (optional)')}"><option value="">${esc(window.EtherealI18n?.t('Automatic (IP estimate)')||'Automatic (IP estimate)')}</option>${options(locale).map(o=>`<option value="${o.code}"${o.code===selected?' selected':''}>${esc(o.name)}</option>`).join('')}</select></label><p>Help us improve translations and create special song collections for different countries.</p><p class="country-disclosure">With Automatic, saving uses <a href="https://country.is/" target="_blank" rel="noopener noreferrer">Country.is</a> to estimate your country from your network IP. We save the country, not your IP. A VPN may change the result.</p>${record?.code?`<p class="country-current">${esc(window.EtherealI18n?.t(record.source==='selected'?'Selected country: {0}':'Estimated country: {0}').replace('{0}',name(record.code,locale))||name(record.code,locale))}</p>`:record?.source==='unavailable'?'<p class="country-current">Country detection is unavailable. You can choose a country or leave it for later.</p>':''}</div>`;
 }
 // Native option names use the selected UI locale without translating musical notation.
 if(typeof window.addEventListener==='function')window.addEventListener('ethereal-languagechange',()=>{
  if(typeof document==='undefined')return;
  document.querySelectorAll('[data-country-select]').forEach(select=>{const selected=select.value,locale=window.EtherealI18n?.language||'en';select.innerHTML=`<option value="">${window.EtherealI18n?.t('Automatic (IP estimate)')||'Automatic (IP estimate)'}</option>`+options(locale).map(o=>`<option value="${o.code}">${o.name}</option>`).join('');select.value=selected;select.setAttribute('aria-label',window.EtherealI18n?.t('Country or region (optional)')||'Country or region (optional)');});
 });
 window.EtherealCountry={codes,names,cleanCountry,mergeCountry,choose,name,options,estimate,resolve,field};
})();
