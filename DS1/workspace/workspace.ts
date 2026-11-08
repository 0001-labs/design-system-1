/** The shared shell's compact breakpoint, also used by its CSS. */
export const workspacePhoneQuery = () => window.matchMedia('(max-width: 600px)');

/** Native HTML adapter; framework consumers keep DOM ownership and use workspacePhoneQuery directly. */
export function connectWorkspaceHeader(header:HTMLElement){
 const views=header.querySelector<HTMLElement>('[data-workspace-views]');
 const find=header.querySelector<HTMLElement>('.header-find');
 const actions=header.querySelector<HTMLElement>('.actions');
 if(!views||!find||!actions)return ()=>{};
 const query=workspacePhoneQuery();
 const place=()=>{
  const parent=query.matches?find:actions;if(views.parentElement===parent)return;
  const focused=views.contains(document.activeElement)?document.activeElement as HTMLElement:null;
  parent.prepend(views);focused?.focus({preventScroll:true});
 };
 place();query.addEventListener('change',place);
 return ()=>query.removeEventListener('change',place);
}
