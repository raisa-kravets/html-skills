(function(){
  const T=window.HTMLSkills;
  if(!T)return;
  const q=(selector,root=document)=>root.querySelector(selector);
  const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const feedback=(root,text,ok)=>T.feedback(q('.feedback',root),text,ok);
  const parse=source=>new DOMParser().parseFromString(source,'text/html');

  q('.check-wrap').addEventListener('click',event=>{
    const field=event.currentTarget.closest('fieldset'),result=T.checkRadio(field);
    if(!result.answered)return feedback(field,'Спочатку обери відповідь.',false);
    feedback(field,result.ok?'Правильно! Щоб зображення працювало як посилання, img потрібно розмістити всередині a.':'Подивись, який тег створює посилання і що повинно знаходитися всередині нього.',result.ok);
  });

  q('.check-alt-caption').addEventListener('click',event=>{
    const card=event.currentTarget.closest('[data-interactive]'),selects=qa('select',card),answered=selects.every(select=>select.value),ok=answered&&selects.every(select=>select.value===select.dataset.answer);
    feedback(card,!answered?'Обери категорію для кожної фрази.':ok?'Правильно! alt передає зміст зображення, а figcaption дає видимий підпис.':'Перевір контекст кожної фрази: опис зображення чи видимий підпис?',ok);
  });

  const figureCard=q('.figure-pieces').closest('.exercise-card'),zone=q('.assembly-zone',figureCard),chosen=[];
  qa('[data-piece]',figureCard).forEach(button=>button.addEventListener('click',()=>{chosen.push(button.dataset.piece);zone.textContent=chosen.join('\n');feedback(figureCard,'',false)}));
  q('.reset-figure',figureCard).addEventListener('click',()=>{chosen.length=0;zone.textContent='';feedback(figureCard,'',false)});
  q('.check-figure',figureCard).addEventListener('click',()=>{
    const doc=parse(chosen.join('')),figure=doc.body.firstElementChild,img=figure&&figure.querySelector(':scope > img'),caption=figure&&figure.querySelector(':scope > figcaption'),ok=figure&&figure.tagName==='FIGURE'&&figure.children.length===2&&img&&img.getAttribute('src')==='images/museum.jpg'&&img.getAttribute('alt')==='Музей-садиба Пирогова'&&caption&&T.compact(caption.textContent)==='Музей-садиба Миколи Пирогова';
    feedback(figureCard,ok?'Правильно! figure містить img, а після нього — figcaption.':'Перевір порядок: figure, img, figcaption із текстом, закривальні теги.',!!ok);
  });

  q('.check-optimize').addEventListener('click',event=>{
    const field=event.currentTarget.closest('fieldset'),result=T.checkRadio(field);
    if(!result.answered)return feedback(field,'Спочатку обери відповідь.',false);
    feedback(field,result.ok?'Зображення має достатні розміри для сторінки й значно менший файл.':'Шукай баланс: достатні розміри зображення та помірний розмір файла.',result.ok);
  });
  q('.check-progressive').addEventListener('click',event=>{
    const field=event.currentTarget.closest('fieldset'),result=T.checkRadio(field);
    if(!result.answered)return feedback(field,'Спочатку обери відповідь.',false);
    feedback(field,result.ok?'Правильно! Зображення поступово стає чіткішим.':'Переглянь схему завантаження progressive JPEG.',result.ok);
  });

  q('.check-fix-link').addEventListener('click',event=>{
    const card=event.currentTarget.closest('[data-interactive]'),doc=parse(q('textarea',card).value),anchor=doc.body.firstElementChild,img=anchor&&anchor.querySelector(':scope > img'),ok=anchor&&anchor.tagName==='A'&&anchor.getAttribute('href')==='tower.html'&&!anchor.hasAttribute('src')&&anchor.children.length===1&&img&&img.getAttribute('src')==='images/tower.jpg'&&!img.hasAttribute('href')&&img.getAttribute('alt')==='Вежа Артинова';
    feedback(card,ok?'Правильно! href належить посиланню a, а src — зображенню img.':'Перевір структуру DOM: a з href має обгортати img із src та alt.',!!ok);
  });

  q('.check-caption-code').addEventListener('click',event=>{
    const card=event.currentTarget.closest('[data-interactive]'),doc=parse(q('textarea',card).value),figure=doc.body.firstElementChild,img=figure&&figure.querySelector(':scope > img'),caption=figure&&figure.querySelector(':scope > figcaption'),items=[['є figure',figure&&figure.tagName==='FIGURE'],['усередині figure є img',!!img],['правильний src',!!img&&img.getAttribute('src')==='images/place.jpg'],['є непорожній alt',!!img&&!!T.normalize(img.getAttribute('alt'))],['є figcaption',!!caption],['правильний текст figcaption',!!caption&&T.compact(caption.textContent)==='Місце, куди я люблю повертатися']],ok=items.every(item=>item[1]);
    T.renderChecklist(q('.check-list',card),items);feedback(card,ok?'Чудово! Зображення й видимий підпис об’єднані правильно.':'Перевір позначені вимоги та спробуй ще раз.',ok);
  });

  const completed=new Set(),score=q('#final-test .score');
  qa('.check-final').forEach(button=>button.addEventListener('click',event=>{
    const card=event.currentTarget.closest('[data-interactive]'),result=T.checkRadio(card),id=card.dataset.test;
    if(!result.answered){completed.delete(id);feedback(card,'Спочатку обери відповідь.',false)}else{result.ok?completed.add(id):completed.delete(id);feedback(card,result.ok?'Правильно.':'Переглянь матеріал теми й спробуй ще раз.',result.ok)}
    score.textContent=completed.size===6?'Тему завершено! Тепер ти вмієш використовувати зображення як повноцінну частину вебсторінки.':'Виконано правильно: '+completed.size+' / 6';
  }));
  q('#final-test').addEventListener('change',event=>{const card=event.target.closest('[data-test]');if(!card)return;completed.delete(card.dataset.test);score.textContent=completed.size?'Виконано правильно: '+completed.size+' / 6':''});
})();
