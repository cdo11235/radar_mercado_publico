'use strict';
const $ = id => document.getElementById(id);
const defaults = {words:'radioterapia, braquiterapia, dosimetría, acelerador lineal, física médica, fantoma',exclude:'',match:'any',state:'',from:'',to:'',sort:'close'};
const states = {5:'Publicada',6:'Cerrada',7:'Desierta',8:'Adjudicada',18:'Revocada',19:'Suspendida'};
let rows = [], loaded = false, lastUpdate = '';
const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const terms = value => normalize(value).split(',').map(term => term.trim()).filter(Boolean);
function getFilters(){return Object.fromEntries(Object.keys(defaults).map(key => [key,$(key).value]));}
function restore(){let saved={};try{saved=JSON.parse(localStorage.getItem('radar-filters-v1'))||{};}catch{}for(const key of Object.keys(defaults)) $(key).value=typeof saved[key]==='string'?saved[key]:defaults[key];}
function element(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
function render(){
 const f=getFilters(), include=terms(f.words), exclude=terms(f.exclude);
 const matches=rows.filter(row=>{
  const text=normalize(`${row.Nombre} ${row.CodigoExterno}`), day=String(row.FechaCierre||'').slice(0,10);
  return (!include.length||(f.match==='all'?include.every(word=>text.includes(word)):include.some(word=>text.includes(word))))&&!exclude.some(word=>text.includes(word))&&(!f.state||String(row.CodigoEstado)===f.state)&&(!f.from||(day&&day>=f.from))&&(!f.to||(day&&day<=f.to));
 });
 matches.sort((a,b)=>f.sort==='name'?String(a.Nombre).localeCompare(String(b.Nombre),'es'):String(a.FechaCierre||'9999').localeCompare(String(b.FechaCierre||'9999')));
 $('count').textContent=matches.length;
 $('results').replaceChildren();
 if(!matches.length){$('results').append(element('div',loaded?'No hay coincidencias. Ajusta los filtros o actualiza la consulta.':'Tus resultados aparecerán aquí.','empty'));return;}
 const fragment=document.createDocumentFragment();
 for(const row of matches){
  const card=element('article','','card'), meta=element('div','','meta');
  meta.append(element('span',row.CodigoExterno),element('span',states[row.CodigoEstado]||'Estado no informado','badge'));
  card.append(meta,element('h3',row.Nombre||'Sin título'));
  card.append(element('p','Cierre informado por Mercado Público: '+(row.FechaCierre?String(row.FechaCierre).replace('T',' ').slice(0,16):'No disponible')));
  const link=element('a','Ver en Mercado Público →');
  link.href='https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?idlicitacion='+encodeURIComponent(row.CodigoExterno);
  link.target='_blank';link.rel='noopener noreferrer';card.append(link);fragment.append(card);
 }
 $('results').append(fragment);
}
function request(params){
 return new Promise((resolve,reject)=>{
  const callback='mp_'+Date.now()+'_'+Math.random().toString(36).slice(2), script=document.createElement('script');
  const cleanup=()=>{clearTimeout(timer);script.remove();window[callback]=()=>{};setTimeout(()=>delete window[callback],60000);};
  const timer=setTimeout(()=>{cleanup();reject(new Error('La API tardó demasiado. Vuelve a intentarlo.'));},30000);
  window[callback]=data=>{cleanup();Array.isArray(data?.Listado)?resolve(data.Listado):reject(new Error('La API no devolvió un listado válido. Revisa el ticket y vuelve a intentarlo.'));};
  script.onerror=()=>{cleanup();reject(new Error('No se pudo conectar con la API. Revisa tu conexión, el ticket y la disponibilidad del servicio.'));};
  const url=new URL('https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.jsonp');
  for(const [key,value] of Object.entries({...params,callback}))url.searchParams.set(key,value);
  script.src=url.href;script.referrerPolicy='no-referrer';document.head.append(script);
 });
}
$('refresh').addEventListener('click',async()=>{
 const ticket=$('ticket').value.trim();if(!ticket){$('status').textContent='Debes ingresar tu ticket de acceso a la API.';$('ticket').focus();return;}
 const params={ticket};
 if($('scope').value==='activas')params.estado='activas';else{if(!$('date').value){$('status').textContent='Selecciona una fecha de consulta.';return;}params.fecha=$('date').value.split('-').reverse().join('');params.estado='todos';}
 $('refresh').disabled=true;$('status').textContent='Consultando Mercado Público…';
 try{const result=await request(params);rows=[...new Map(result.filter(row=>row&&row.CodigoExterno).map(row=>[row.CodigoExterno,row])).values()];loaded=true;lastUpdate=new Date().toLocaleString('es-CL',{timeZone:'America/Santiago'});render();$('status').textContent=`Actualizado ${lastUpdate} (Chile). ${rows.length} licitaciones consultadas. ${params.estado==='activas'?'Consulta de activas.':'Fecha consultada '+$('date').value+'.'}`;}
 catch(error){$('status').textContent=error.message+(loaded?' Se conservan los resultados anteriores de '+lastUpdate+'.':'');}
 finally{$('refresh').disabled=false;}
});
for(const key of Object.keys(defaults))$(key).addEventListener('input',()=>{try{localStorage.setItem('radar-filters-v1',JSON.stringify(getFilters()));}catch{}render();});
$('reset').onclick=()=>{for(const [key,value] of Object.entries(defaults))$(key).value=value;try{localStorage.removeItem('radar-filters-v1');}catch{}render();};
$('scope').onchange=()=>{$('dateLabel').hidden=$('scope').value!=='fecha';};
$('date').value=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
restore();render();
