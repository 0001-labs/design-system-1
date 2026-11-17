const small=new URL('./cursor/arrow-cursor-small.png',import.meta.url).href;
const retina=new URL('./cursor/arrow-cursor-rounded.png',import.meta.url).href;
const retinaSet=`image-set(url('${small}') 1x, url('${retina}') 2x) 2 2, default`;
const appCursor=CSS.supports('cursor',retinaSet)?retinaSet:`url('${small}') 2 2, default`;
const replaced=new Set(['default','pointer']);
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');

export function installAppCursor():void{
  const style=document.createElement('style');
  style.textContent=`@media (hover:hover) and (pointer:fine){:root{cursor:${appCursor}}:where(input:not([type=button],[type=submit],[type=reset],[type=checkbox],[type=radio],[type=range],[type=color],[type=file]),textarea,[contenteditable]:not([contenteditable=false])){cursor:text}}`;
  document.head.prepend(style);
  document.addEventListener('pointerover',event=>{
    if(!finePointer.matches) return;
    for(const node of event.composedPath()) if(node instanceof HTMLElement&&replaced.has(getComputedStyle(node).cursor)) node.style.setProperty('cursor',appCursor);
  },true);
}
