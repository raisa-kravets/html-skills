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
  window.HTMLSkills=api;
  const init=()=>{api.enableImageZoom();api.enableOptionalImages(document);api.clearFeedbackOnChange(document);api.enableLivePreviews(document)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
