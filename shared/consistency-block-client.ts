import {configureI18n} from '../DS1/index';
import {defineAaDiagram} from '../website/src/vendor/aa/diagram.js';
import {componentWords} from './consistency-component-words';
configureI18n({autoLoad:false});
defineAaDiagram();
async function hydrate(){
 for(const element of document.querySelectorAll<HTMLElement>('[data-c9y-component-data]')){
  if(element.dataset.c9yHydrated!==undefined)continue;const value=JSON.parse(element.dataset.c9yComponentData!);
  Object.assign(element,value.properties??{});element.dataset.c9yHydrated='';
  await (element as HTMLElement&{updateComplete?:Promise<unknown>}).updateComplete;
  for(const[key,style]of Object.entries(value.styles??{}))element.style.setProperty(key,String(style).replace(/!important$/,''),String(style).endsWith('!important')?'important':'');
  componentWords(element,(text,key)=>{if(Object.hasOwn(value.words??{},key))text.textContent=value.words[key];});
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>void hydrate(),{once:true});else void hydrate();
