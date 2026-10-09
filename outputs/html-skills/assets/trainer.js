(function(){
  if(window.HTMLSkills)return;
  const api={};
  api.feedback=function(el,text,ok){if(!el)return;el.textContent=text;el.classList.remove('is-correct','is-error');el.classList.add(ok?'is-correct':'is-error')};
  api.renderChecklist=function(list,items){if(!list)return;list.replaceChildren();items.forEach(item=>{const label=Array.isArray(item)?item[0]:item.label,ok=Array.isArray(item)?item[1]:item.ok,li=document.createElement('li');li.className=ok?'ok':'bad';li.textContent=(ok?'✓ ':'✗ ')+label;list.append(li)})};
  api.toggle=function(button,target){if(!button||!target)return;target.hidden=!target.hidden;button.setAttribute('aria-expanded',String(!target.hidden))};
  api.preview=function(frame,source){if(frame)frame.srcdoc=source};
  api.normalize=function(value){return String(value||'').replace(/\r/g,'').trim()};
  api.compact=function(value){return api.normalize(value).replace(/\s+/g,' ').trim()};
  api.parseElement=function(source,tag){const value=api.normalize(source),re=new RegExp('^<'+tag+'\\b([^<>]*)>([\\s\\S]*?)<\\/'+tag+'\\s*>$','i'),m=value.match(re);if(!m)return null;const attrs={},raw=m[1],attrRe=/\s+([a-zA-Z][\w:-]*)\s*=\s*(["'])(.*?)\2/g;let item,last=0;while((item=attrRe.exec(raw))){if(raw.slice(last,item.index).trim())return null;attrs[item[1].toLowerCase()]=item[3];last=attrRe.lastIndex}if(raw.slice(last).trim())return null;return{tag:tag.toLowerCase(),attrs:attrs,text:m[2].trim()}};
  api.checkElement=function(source,expected){const p=api.parseElement(source,expected.tag);if(!p)return{ok:false,reason:'structure'};if(api.compact(p.text)!==api.compact(expected.text))return{ok:false,reason:'text'};for(const key of Object.keys(expected.attrs||{})){if(p.attrs[key]!==expected.attrs[key])return{ok:false,reason:key}}return{ok:true,element:p}};
  api.checkRadio=function(fieldset){const c=fieldset.querySelector('input[type="radio"]:checked'),answer=fieldset.dataset.answer||fieldset.dataset.a;return{answered:!!c,ok:!!c&&c.value===answer,value:c?c.value:null}};
  api.extractSection=function(source,tag){const re=new RegExp('<'+tag+'\\b[^>]*>([\\s\\S]*?)<\\/'+tag+'\\s*>','i'),m=api.normalize(source).match(re);return m?m[1]:null};
  api.analyzeDocument=function(source){const s=api.normalize(source),htmlOpen=s.match(/<html\b([^>]*)>/i),head=api.extractSection(s,'head'),body=api.extractSection(s,'body'),lang=htmlOpen&&htmlOpen[1].match(/\blang\s*=\s*(["'])(.*?)\1/i);return{source:s,doctype:/^\s*<!DOCTYPE\s+html\s*>/i.test(s),htmlOpen:!!htmlOpen,htmlClose:/<\/html\s*>\s*$/i.test(s),lang:lang?lang[2]:null,head:head,body:body,headClosed:/<\/head\s*>/i.test(s),bodyClosed:/<\/body\s*>/i.test(s),hasMetaUtf8:head!==null&&/<meta\s+charset\s*=\s*(["'])UTF-8\1\s*>/i.test(head)}};
  api.hasElement=function(section,tag,text){if(section===null)return false;const re=new RegExp('<'+tag+'\\b[^>]*>([\\s\\S]*?)<\\/'+tag+'\\s*>','i'),m=section.match(re);return!!m&&(text===undefined||api.compact(m[1])===api.compact(text))};
  api.parseMarkup=function(source){
    const input=api.normalize(source),root={tag:'#root',children:[]},stack=[root],voidTags=new Set(['br','hr','meta']),tokenRe=/<!DOCTYPE\s+html\s*>|<\/?[a-z][^<>]*>|[^<]+/gi;let match,last=0,doctype=false,error='';
    while((match=tokenRe.exec(input))){if(match.index!==last){error='invalid';break}const token=match[0];last=tokenRe.lastIndex;if(/^<!DOCTYPE/i.test(token)){if(stack.length!==1||doctype){error='doctype';break}doctype=true;continue}if(token[0]!=='<'){stack[stack.length-1].children.push({tag:'#text',text:token});continue}const close=token.match(/^<\/\s*([a-z][\w-]*)\s*>$/i);if(close){const tag=close[1].toLowerCase();if(stack.length===1||stack[stack.length-1].tag!==tag){error='closing';break}stack.pop();continue}const open=token.match(/^<\s*([a-z][\w-]*)([^<>]*)>$/i);if(!open){error='attributes';break}const attrs={},raw=open[2];let attr,lastAttr=0,attrRe=/\s+([a-zA-Z][\w:-]*)\s*=\s*(["'])(.*?)\2/g;while((attr=attrRe.exec(raw))){if(raw.slice(lastAttr,attr.index).trim()){error='attributes';break}attrs[attr[1].toLowerCase()]=attr[3];lastAttr=attrRe.lastIndex}if(error||raw.slice(lastAttr).trim()){error='attributes';break}const node={tag:open[1].toLowerCase(),attrs,children:[]};stack[stack.length-1].children.push(node);if(!voidTags.has(node.tag))stack.push(node)}
    if(!error&&(last!==input.length||stack.length!==1))error='unclosed';
    const text=node=>api.compact((node.children||[]).map(child=>child.tag==='#text'?child.text:child.tag==='br'?' ':text(child)).join(''));
    const elements=node=>(node.children||[]).filter(child=>child.tag!=='#text');
    const find=(node,tag)=>elements(node).find(child=>child.tag===tag)||null;
    return{ok:!error,error,doctype,root,text,elements,find};
  };
  api.clearFeedbackOnChange=function(root){
    const scope=root||document;if(scope.documentElement&&scope.documentElement.dataset.feedbackResetBound==='true')return;
    if(scope.documentElement)scope.documentElement.dataset.feedbackResetBound='true';
    const clear=event=>{const control=event.target.closest&&event.target.closest('[data-reset-feedback]');if(!control)return;const card=control.closest('[data-interactive]');if(!card)return;card.querySelectorAll('.feedback').forEach(el=>{el.textContent='';el.classList.remove('is-correct','is-error')})};
    scope.addEventListener('change',clear);scope.addEventListener('input',clear);
  };
  api.enableLivePreviews=function(root){
    (root||document).querySelectorAll('.code-task').forEach(card=>{
      if(card.dataset.livePreviewBound==='true')return;
      const editor=card.querySelector('textarea'),frame=card.querySelector('iframe.preview-frame');if(!editor||!frame)return;
      card.dataset.livePreviewBound='true';
      if(!frame.previousElementSibling||!frame.previousElementSibling.classList.contains('preview-label')){const label=document.createElement('p');label.className='preview-label';label.innerHTML='<strong>Результат у браузері</strong>';frame.before(label)}
      let timer;const update=()=>{clearTimeout(timer);timer=setTimeout(()=>{frame.srcdoc=editor.value},300)};
      editor.addEventListener('input',update);frame.srcdoc=editor.value;
    });
  };
  api.enableImageZoom=function(){
    const triggers=[...document.querySelectorAll('[data-zoomable-image]')];
    if(!triggers.length||document.querySelector('.image-lightbox'))return;
    const dialog=document.createElement('dialog');dialog.className='image-lightbox';dialog.innerHTML='<div class="image-lightbox-inner"><button type="button" class="image-lightbox-close" aria-label="Закрити збільшене зображення">×</button><img alt=""></div>';document.body.append(dialog);
    const image=dialog.querySelector('img'),close=dialog.querySelector('.image-lightbox-close');
    const closeDialog=()=>dialog.close();
    triggers.forEach(trigger=>trigger.addEventListener('click',()=>{const source=trigger.querySelector('img');image.src=source.currentSrc||source.src;image.alt=source.alt;dialog.showModal();close.focus()}));
    close.addEventListener('click',closeDialog);image.addEventListener('click',closeDialog);dialog.addEventListener('click',event=>{if(event.target===dialog)closeDialog()});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&dialog.open){event.preventDefault();closeDialog()}});
  };
  api.enableOptionalImages=function(root){(root||document).querySelectorAll('[data-image-path]').forEach(slot=>{if(slot.dataset.imageChecked==='true')return;slot.dataset.imageChecked='true';const image=new Image();image.className='responsive-image';image.alt=slot.dataset.imageAlt||'';image.addEventListener('load',()=>{const figure=document.createElement('figure');figure.className='zoomable-figure';const button=document.createElement('button');button.type='button';button.className='zoomable-image-button';button.dataset.zoomableImage='';button.setAttribute('aria-label','Збільшити навчальну інфографіку');button.append(image);figure.append(button);slot.replaceChildren(figure);api.enableImageZoom()},{once:true});image.src=slot.dataset.imagePath})};
  api.enableTextCopy=function(root){(root||document).querySelectorAll('.copy-text-button').forEach(button=>{if(button.dataset.copyBound==='true')return;button.dataset.copyBound='true';button.addEventListener('click',async()=>{const card=button.closest('details'),source=card&&card.querySelector('.copy-source'),feedback=card&&card.querySelector('.copy-feedback');if(!source)return;const value=source.innerText.trim();try{await navigator.clipboard.writeText(value);if(feedback)feedback.textContent='Текст скопійовано'}catch(error){if(feedback)feedback.textContent='Не вдалося скопіювати текст'}})})};
  api.enableProjectResultPreviews=function(root){
    const intro='<h1>Моє місто — Вінниця</h1><p>Вінниця — місто в Україні, розташоване на берегах Південного Бугу.</p><p>На цьому сайті я розповім про цікаві місця Вінниці та поділюся маршрутом для знайомства з містом.</p>';
    const homeText=intro+'<h2>Коротко про Вінницю</h2><p>Вінниця — адміністративний центр Вінницької області. Місто має давню історію та поєднує історичну забудову із сучасними громадськими просторами.</p><h3>Розташування</h3><p>Місто розташоване на берегах річки Південний Буг.</p><h2>Місто, яке варто побачити</h2><p>Вінниця — сучасне та комфортне місто з багатою історією, затишними вулицями, парками та цікавими культурними місцями.</p>';
    const aboutText='<h1>Вінниця: сторінки історії</h1><p>Від давнього поселення до міста з багатовіковою історією. Дізнаймося, як змінювалася Вінниця.</p><h2>Витоки міста</h2><p>Територія сучасної Вінниці була заселена з давніх часів. Про це свідчать залишки стародавніх городищ.</p><h2>Походження назви</h2><p>Походження назви Вінниці остаточно не з’ясоване.</p><h2>Як змінювалася Вінниця</h2><h3>Місто зростає</h3><p>У 1598 році Вінниця стала центром Брацлавського воєводства.</p>';
    const towerText='<h1>Вежа Артинова</h1><p>Історична водонапірна вежа в центрі Вінниці — одна з найвідоміших архітектурних пам’яток міста.</p><h2>Про пам’ятку</h2><p>Вежа Артинова — це історична водонапірна вежа, розташована в самому центрі Вінниці.</p><h2>Історія</h2><h3>Спорудження</h3><p>Вежу збудували наприкінці XIX століття як частину міської системи водопостачання.</p><h2>Цікаві факти</h2><p>Висота вежі становить близько 28 метрів.</p>';
    const semantic=text=>text.replace('Вінниця — адміністративний центр','<strong>Вінниця — адміністративний центр</strong>').replace('Історична водонапірна вежа','<strong>Історична водонапірна вежа</strong>');
    const nav='<p><a href="index.html">Головна</a> | <a href="about.html">Про місто</a> | <a href="tower.html">Вежа Артинова</a> | <a href="pyrogov.html">Музей Пирогова</a> | <a href="europe.html">Європейська площа</a></p>';
    const listNav='<ul><li><a href="index.html">Головна</a></li><li><a href="about.html">Про місто</a></li><li>Місця<ul><li><a href="tower.html">Вежа Артинова</a></li><li><a href="pyrogov.html">Музей Пирогова</a></li><li><a href="europe.html">Європейська площа</a></li></ul></li></ul>';
    const pages={
      1:[['Головна','index.html',intro]],
      2:[['Головна','index.html',intro]],
      3:[['Головна','index.html',homeText],['Про Вінницю','about.html',aboutText],['Вежа','tower.html',towerText]],
      4:[['Головна','index.html',semantic(homeText)],['Вежа','tower.html',semantic(towerText)]],
      5:[['Про Вінницю','about.html',aboutText+'<p>Площа Вінниці становить 113,2 км<sup>2</sup>.</p><address>Навчальний автор<br>Email: student@example.com</address>'],['Вежа','tower.html',towerText+'<p>Сторінку оновлено <time datetime="2026-10-01">1 жовтня 2026 року</time>.</p>']],
      6:[['Головна','index.html',nav+semantic(homeText)],['Про Вінницю','about.html',nav+'<p><a href="#origins">Витоки міста</a> | <a href="#sources">Джерела</a></p>'+aboutText.replace('<h2>Витоки міста</h2>','<h2 id="origins">Витоки міста</h2>')+'<h2 id="sources">Джерела</h2><p><a href="https://www.vmr.gov.ua/" target="_blank">Вінницька міська рада</a></p>']],
      7:[['Головна','index.html',listNav+semantic(homeText)+'<h2>Цікаві місця</h2><ul><li>Вежа Артинова</li><li>Європейська площа</li><li>Вінницькі мури</li></ul>'],['Про Вінницю','about.html',listNav+aboutText+'<h2>Походження назви</h2><ul><li>Зв’язок із назвою річки Віннички.</li><li>Походження від давнього слова «віно».</li><li>Версія про зв’язок із винокурінням.</li></ul>']],
      8:[['Головна','index.html',listNav+intro+'<img src="../images/Vinnytsia.jpg" alt="Панорама центральної частини Вінниці">'+homeText.slice(intro.length)+'<h2>Що варто побачити у Вінниці</h2><ul><li>Вежа Артинова</li><li>Європейська площа</li><li>Музей Пирогова</li></ul>'],['Про Вінницю','about.html',listNav+aboutText.replace('<h2>Витоки міста</h2>','<h2>Витоки міста</h2><img src="../images/kozytskijstreetvinnytsiaold.webp" alt="Історична вулиця Вінниці">')],['Вежа','tower.html',listNav+towerText.replace('<h2>Про пам’ятку</h2>','<h2>Про пам’ятку</h2><img src="../images/tower.jpg" alt="Вежа Артинова у Вінниці">')]]
    };
    const documentFor=body=>'<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:16px serif;color:#000;background:#fff;padding:8px}img{max-width:100%;height:auto}a{color:#00e}address{margin:1em 0}</style></head><body>'+body+'</body></html>';
    const scope=root||document,match=location.pathname.match(/topic-(\d+)(?:\.html)?\/?$/),project=scope.querySelector('#project');
    if(project&&match&&!project.querySelector('.project-result-preview')){const container=document.createElement('div');container.className='project-result-preview';container.dataset.topic=String(Number(match[1]));const target=project.querySelector('article:last-of-type')||project;target.append(container)}
    scope.querySelectorAll('.project-result-preview[data-topic]').forEach(container=>{
      if(container.dataset.ready==='true')return;const topic=Number(container.dataset.topic),items=pages[topic];if(!items)return;container.dataset.ready='true';container.innerHTML='<h3>👀 Результат після цієї теми</h3><p>Орієнтуйся на структуру та елементи сторінки. Точний дизайн сформуємо пізніше.</p><p class="project-preview-note">Не хвилюйся, якщо результат ще не схожий на фінальний макет — зараз перевіряємо лише HTML, який уже вивчили.</p><div class="project-preview-tabs" role="tablist" aria-label="Сторінки проміжного результату"></div><div class="project-preview-browser"><div class="project-preview-bar"><span aria-hidden="true">● ● ●</span><strong></strong></div><iframe title="Проміжний результат сторінки" sandbox></iframe></div>';
      const tabs=container.querySelector('.project-preview-tabs'),frame=container.querySelector('iframe'),file=container.querySelector('.project-preview-bar strong');
      const show=index=>{const item=items[index];file.textContent=item[1];frame.srcdoc=documentFor(item[2]);[...tabs.children].forEach((tab,i)=>{const active=i===index;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1})};
      items.forEach((item,index)=>{const button=document.createElement('button');button.type='button';button.setAttribute('role','tab');button.textContent=item[0];button.addEventListener('click',()=>show(index));button.addEventListener('keydown',event=>{if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:-1)+items.length)%items.length;tabs.children[next].focus();show(next)});tabs.append(button)});show(0);
    });
  };
  window.HTMLSkills=api;
  const init=()=>{api.enableImageZoom();api.enableOptionalImages(document);api.enableTextCopy(document);api.clearFeedbackOnChange(document);api.enableLivePreviews(document);api.enableProjectResultPreviews(document)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
