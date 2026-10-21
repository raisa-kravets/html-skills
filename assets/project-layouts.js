(function(){
  const sections=[...document.querySelectorAll('.project-layout-section')],layoutButtons=[...document.querySelectorAll('[data-layout]')],modeButtons=[...document.querySelectorAll('[data-mode]')];
  if(!sections.length)return;
  let current=(location.hash||'#home').slice(1);if(!sections.some(section=>section.id===current))current='home';let mode='regular';
  function render(){sections.forEach(section=>{const active=section.id===current;section.hidden=!active;if(active){const cards=[...section.querySelectorAll('.project-layout-grid>.lesson-card')];cards.forEach((card,index)=>card.hidden=index!==(mode==='regular'?0:1))}});layoutButtons.forEach(button=>{const active=button.dataset.layout===current;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1});modeButtons.forEach(button=>{const active=button.dataset.mode===mode;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active))});const section=document.getElementById(current);if(section)document.title=section.querySelector('h2').textContent+' — Макети сторінок проєкту'}
  layoutButtons.forEach(button=>button.addEventListener('click',()=>{current=button.dataset.layout;history.replaceState(null,'','#'+current);render()}));
  modeButtons.forEach(button=>button.addEventListener('click',()=>{mode=button.dataset.mode;render()}));
  addEventListener('hashchange',()=>{const next=location.hash.slice(1);if(sections.some(section=>section.id===next)){current=next;render()}});render();
})();
