(function(){
  const T=window.HTMLSkills;if(!T)return;
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const feedback=(card,text,ok)=>T.feedback(q('.feedback',card),text,ok);
  const parse=(source)=>{const template=document.createElement('template');template.innerHTML=source;return template.content};
  const imageFrom=(source)=>parse(source).querySelector('img');
  const bind=(selector,handler)=>qa(selector).forEach(button=>button.addEventListener('click',handler));

  const builder=q('#build-image'),zone=q('.assembly-zone',builder);let built='';
  qa('[data-piece]',builder).forEach(button=>button.addEventListener('click',()=>{built+=button.dataset.piece;zone.textContent=built;feedback(builder,'',false)}));
  q('.reset-build',builder).addEventListener('click',()=>{built='';zone.textContent='';feedback(builder,'',false)});
  q('.check-build',builder).addEventListener('click',()=>{const img=imageFrom(built),ok=!!img&&img.getAttribute('src')==='vinnytsia.jpg'&&img.getAttribute('alt')==='Вінниця'&&!built.includes('</img>');feedback(builder,ok?'Правильно! Тег <img> містить шлях до файла та його текстовий опис.':'Підказка: почни з <img, потім додай src, alt і закрий тег символом >.',ok)});

  const checkSelects=(card,success)=>{const fields=qa('select[data-answer]',card);if(fields.some(field=>!field.value))return feedback(card,'Обери відповідь у кожному полі.',false);const wrong=fields.filter(field=>field.value!==field.dataset.answer).length;feedback(card,wrong?'Перевір відповідність атрибутів і пояснень.':success,!wrong)};
  q('.check-attributes').addEventListener('click',event=>checkSelects(event.currentTarget.closest('[data-interactive]'),'Правильно! src указує файл, alt описує зображення, width задає ширину.'));
  q('.check-formats').addEventListener('click',event=>checkSelects(event.currentTarget.closest('[data-interactive]'),'Правильно! Це типові формати для таких зображень.'));

  q('.check-path-choice').addEventListener('click',event=>{const card=event.currentTarget.closest('[data-interactive]'),result=T.checkRadio(q('fieldset',card));if(!result.answered)return feedback(card,'Спочатку обери один варіант.',false);feedback(card,result.ok?'Правильно! Файл fountain.jpg знаходиться у папці images, тому назва папки входить до шляху.':'Подивись на структуру папок: файл лежить не поруч з index.html.',result.ok)});
  q('.check-fix-path').addEventListener('click',event=>{const card=event.currentTarget.closest('[data-interactive]'),img=imageFrom(q('textarea',card).value),ok=!!img&&img.getAttribute('src')==='images/tower.jpg';feedback(card,ok?'Правильно! Тепер браузер може знайти файл tower.jpg.':'Перевір саме ім’я файла в src: у структурі папок воно записане як tower.jpg.',ok)});
  q('.check-alt').addEventListener('click',event=>{const card=event.currentTarget.closest('[data-interactive]'),result=T.checkRadio(q('fieldset',card));if(!result.answered)return feedback(card,'Спочатку обери один варіант.',false);feedback(card,result.ok?'Правильно! alt описує зміст зображення, а не просто повідомляє, що це картинка.':'Шукай конкретний опис того, що важливо на фотографії.',result.ok)});
  q('.check-fix-src').addEventListener('click',event=>{const card=event.currentTarget.closest('[data-interactive]'),img=imageFrom(q('textarea',card).value),ok=!!img&&img.hasAttribute('src')&&!img.hasAttribute('scr')&&img.getAttribute('src')==='images/park.jpg';feedback(card,ok?'Так! Атрибут називається src.':'Знайди помилкову назву scr і заміни її на src. Інший код змінювати не потрібно.',ok)});

  q('.check-complete-image').addEventListener('click',event=>{const card=event.currentTarget.closest('[data-interactive]'),source=q('textarea',card).value,doc=parse(source),img=doc.querySelector('img'),h2=doc.querySelector('h2'),paragraph=doc.querySelector('p'),items=[['Є тег <img>',!!img],['src="images/place.jpg"',!!img&&img.getAttribute('src')==='images/place.jpg'],['alt="Моє улюблене місце"',!!img&&img.getAttribute('alt')==='Моє улюблене місце'],['width="500"',!!img&&img.getAttribute('width')==='500'],['Зображення стоїть між h2 і абзацом',!!img&&!!h2&&!!paragraph&&h2.compareDocumentPosition(img)&Node.DOCUMENT_POSITION_FOLLOWING&&img.compareDocumentPosition(paragraph)&Node.DOCUMENT_POSITION_FOLLOWING]],ok=items.every(item=>!!item[1]);T.renderChecklist(q('.check-list',card),items);feedback(card,ok?'Чудово! Тег <img> має всі потрібні атрибути й стоїть у правильному місці.':'Перевір позначені вимоги та спробуй ще раз.',ok)});

  const normalizePathAnswer=value=>{const text=value.trim(),attribute=text.match(/^src\s*=\s*(["'])(.*?)\1$/i);return attribute?attribute[2].trim():text};
  bind('.check-path-input',event=>{const card=event.currentTarget.closest('[data-interactive]'),value=normalizePathAnswer(q('input',card).value),ok=value===card.dataset.answer;feedback(card,ok?'Правильний шлях!':'Прочитай структуру від index.html: спочатку папка, потім ім’я файла.',ok)});

  const completed=new Set(),score=q('#final-test .score');
  const mark=(card,ok)=>{if(ok)completed.add(card.dataset.test);else completed.delete(card.dataset.test);score.textContent=completed.size===5?'Тему завершено! Тепер ти вмієш додавати зображення до HTML-сторінки та правильно вказувати шлях до файла.':'Виконано правильно: '+completed.size+' / 5'};
  bind('.check-final-radio',event=>{const card=event.currentTarget.closest('[data-interactive]'),result=T.checkRadio(card);if(!result.answered){feedback(card,'Спочатку обери відповідь.',false);return mark(card,false)}feedback(card,result.ok?'Правильно.':'Переглянь матеріал теми й спробуй ще раз.',result.ok);mark(card,result.ok)});
  bind('.check-final-text',event=>{const card=event.currentTarget.closest('[data-interactive]'),value=q('input',card).value.trim().toLowerCase().replace(/[<>]/g,''),answer=card.dataset.answer.toLowerCase(),ok=value===answer;feedback(card,ok?'Правильно.':'Перевір написання й спробуй ще раз.',ok);mark(card,ok)});

  document.addEventListener('change',event=>{const card=event.target.closest('[data-interactive]');if(card&&card.dataset.test){completed.delete(card.dataset.test);score.textContent=completed.size?'Виконано правильно: '+completed.size+' / 5':''}});
  document.addEventListener('input',event=>{const card=event.target.closest('[data-interactive]');if(card&&card.dataset.test){completed.delete(card.dataset.test);score.textContent=completed.size?'Виконано правильно: '+completed.size+' / 5':''}});
})();
