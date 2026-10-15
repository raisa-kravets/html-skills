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

  const resultPreview=q('.project-result-preview[data-topic="9"]');
  if(resultPreview){
    const nav='<ul><li><a href="index.html">Головна</a></li><li><a href="about.html">Про місто</a></li><li>Місця<ul><li><a href="tower.html">Вежа Артинова</a></li><li><a href="europe-square.html">Європейська площа</a></li><li><a href="pirogov-museum.html">Музей Пирогова</a></li></ul></li><li><a href="#route">Маршрут</a></li></ul>';
    const figure=(src,alt,caption)=>'<figure><img src="images/'+src+'" alt="'+alt+'"><figcaption>'+caption+'</figcaption></figure>';
    const pages=[
      ['Головна','index.html',nav+'<h1>Моє місто — Вінниця</h1><p>Вінниця — місто в Україні, розташоване на берегах Південного Бугу.</p><p>На цьому сайті я розповім про цікаві місця Вінниці та поділюся маршрутом для знайомства з містом.</p><img src="images/Vinnytsia.jpg" alt="Панорама центральної частини Вінниці"><p>Вінниця на берегах Південного Бугу</p><h2>Що варто побачити у Вінниці</h2><h3>Вежа Артинова</h3><a href="tower.html"><img src="images/tower.jpg" alt="Вежа Артинова у центрі Вінниці"></a><p>Історична водонапірна вежа у центрі міста.</p><p><a href="tower.html">Дізнатися більше →</a></p><h3>Європейська площа</h3><a href="europe-square.html"><img src="images/europe.jpg" alt="Європейська площа у Вінниці"></a><p>Сучасний громадський простір для прогулянок.</p><p><a href="europe-square.html">Дізнатися більше →</a></p><h3>Музей Пирогова</h3><a href="pirogov-museum.html"><img src="images/Pyrogov.jpg" alt="Головний будинок музею-садиби Миколи Пирогова"></a><p>Меморіальний музей-садиба видатного хірурга.</p><p><a href="pirogov-museum.html">Дізнатися більше →</a></p>'],
      ['Про Вінницю','about.html',nav+'<p><a href="index.html">Головна</a> / Про місто</p><h1>Вінниця: сторінки історії</h1><p>Від давнього поселення до міста з багатовіковою історією. Дізнаймося, як змінювалася Вінниця.</p><h2>Витоки міста</h2><p>Територія сучасної Вінниці була заселена з давніх часів. Про це свідчать залишки стародавніх городищ.</p><p>За історіографічною традицією заснування міста датують 1363 роком.</p>'+figure('kozytskijstreetvinnytsiaold.webp','Історичний вигляд Вінниці','Ілюстрація історичної Вінниці')+'<h2>Походження назви</h2><p>Походження назви Вінниці остаточно не з’ясоване.</p>'],
      ['Вежа','tower.html',nav+'<p><a href="index.html">Головна</a> / Місця / Вежа Артинова</p><h1>Вежа Артинова</h1><p>Історична водонапірна вежа в центрі Вінниці — одна з найвідоміших архітектурних пам’яток міста.</p><h2>Про пам’ятку</h2><p>Вежа Артинова — історична водонапірна вежа, розташована в самому центрі Вінниці.</p>'+figure('tower.jpg','Вежа Артинова у центрі Вінниці','Вежа Артинова у Вінниці')+'<h2>Історія</h2><p>Вежу збудували наприкінці XIX століття як частину міської системи водопостачання.</p>'],
      ['Європейська площа','europe-square.html',nav+'<p><a href="index.html">Головна</a> / Місця / Європейська площа</p><h1>Європейська площа</h1><p>Європейська площа — один із головних громадських просторів Вінниці.</p><h2>Сучасна площа</h2><p>Сьогодні Європейська площа — центральний громадський простір Вінниці.</p>'+figure('europe.jpg','Сучасна Європейська площа у Вінниці','Європейська площа у Вінниці')+'<h2>Радянський меморіальний період</h2><p>У радянські часи площа виконувала роль меморіального простору.</p>'+figure('memorial.jfif','Меморіальний ансамбль на Європейській площі','Меморіальний ансамбль на Європейській площі')],
      ['Музей Пирогова','pirogov-museum.html',nav+'<p><a href="index.html">Головна</a> / Місця / Музей М. І. Пирогова</p><h1>Музей Пирогова</h1><p>Національний музей-садиба М. І. Пирогова — унікальне місце у Вінниці.</p><h2>Про музей</h2><p>Меморіальний комплекс присвячений життю і діяльності видатного хірурга.</p>'+figure('Pyrogov.jpg','Головний будинок музею-садиби Миколи Пирогова','Головний будинок музейної садиби Пирогова')+'<h2>Історія</h2><h3>Останні роки життя</h3>'+figure('pyrogov_photo.jfif','Портрет Миколи Івановича Пирогова','Микола Іванович Пирогов')+'<h3>Створення музею</h3>'+figure('museum_creation.jfif','Історичне зображення садиби Миколи Пирогова','Створення музею')+'<h3>Унікальний комплекс</h3>'+figure('Pyrogova_Kabinet.jpg','Інтер’єр музею-садиби Миколи Пирогова','Кабінет ученого в музейній садибі')]
    ];
    const documentFor=(title,body)=>'<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="../"><title>'+title+'</title></head><body>'+body+'</body></html>';
    const tabs=q('.project-preview-tabs',resultPreview),frame=q('iframe',resultPreview),file=q('.project-preview-bar strong',resultPreview);
    const show=index=>{const item=pages[index];file.textContent=item[1];frame.srcdoc=documentFor(item[1],item[2]);qa('button',tabs).forEach((tab,i)=>{const active=i===index;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1})};
    pages.forEach((item,index)=>{const button=document.createElement('button');button.type='button';button.setAttribute('role','tab');button.textContent=item[0];button.addEventListener('click',()=>show(index));button.addEventListener('keydown',event=>{if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;event.preventDefault();const next=(index+(event.key==='ArrowRight'?1:-1)+pages.length)%pages.length;tabs.children[next].focus();show(next)});tabs.append(button)});
    show(0);
  }
})();
