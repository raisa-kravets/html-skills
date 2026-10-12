(function(){
  const T=window.HTMLSkills;
  if(!T)return;
  const q=(selector,root=document)=>root.querySelector(selector);
  const qa=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const setFeedback=(root,text,ok,selector='.feedback')=>T.feedback(q(selector,root),text,ok);
  const parse=source=>new DOMParser().parseFromString(source,'text/html');

  function checkSelectTask(buttonSelector){
    q(buttonSelector).addEventListener('click',event=>{
      const card=event.currentTarget.closest('[data-interactive]');
      const selects=qa('select',card);
      const answered=selects.every(select=>select.value);
      const ok=answered&&selects.every(select=>select.value===select.dataset.answer);
      setFeedback(card,!answered?'Обери тег для кожної ситуації.':ok?'Правильно! Усі частини сторінки мають відповідні семантичні теги.':'Перевір роль кожного блоку й спробуй ще раз.',ok);
    });
  }
  checkSelectTask('.check-matching');
  checkSelectTask('.check-section-article');

  q('.check-replace-div').addEventListener('click',event=>{
    const card=event.currentTarget.closest('[data-interactive]');
    const doc=parse(q('textarea',card).value);
    const body=doc.body;
    const header=body.firstElementChild;
    const main=header&&header.nextElementSibling;
    const footer=main&&main.nextElementSibling;
    const section=main&&main.firstElementChild;
    const article=section&&section.querySelector(':scope > article');
    const items=[
      ['перший блок — header з h1',header&&header.tagName==='HEADER'&&!!header.querySelector(':scope > h1')],
      ['після header розташований main',main&&main.tagName==='MAIN'],
      ['main містить section з h2',section&&section.tagName==='SECTION'&&!!section.querySelector(':scope > h2')],
      ['section містить article з h3 і p',article&&!!article.querySelector(':scope > h3')&&!!article.querySelector(':scope > p')],
      ['після main розташований footer з p',footer&&footer.tagName==='FOOTER'&&!!footer.querySelector(':scope > p')],
      ['у структурі не залишилося зайвих div',body.querySelectorAll('div').length===0]
    ];
    const ok=items.every(item=>item[1]);
    T.renderChecklist(q('.check-list',card),items);
    setFeedback(card,ok?'Чудово! Семантичні теги та вкладення правильні.':'Перевір позначені вимоги. Форматування й зайві пробіли не впливають на перевірку.',ok);
  });

  function setupBuilder(level,expected){
    const card=q('.build-task');
    const bank=q('.'+level,card);
    const zone=q('.'+level+'-zone',card);
    const feedbackSelector='.'+level+'-feedback';
    const selected=[];
    qa('[data-piece]',bank).forEach(button=>button.addEventListener('click',()=>{
      selected.push(button.dataset.piece);
      button.disabled=true;
      zone.textContent=selected.join('\n');
      T.feedback(q(feedbackSelector,card),'',false);
    }));
    q('.reset-'+level,card).addEventListener('click',()=>{
      selected.length=0;
      zone.textContent='';
      qa('[data-piece]',bank).forEach(button=>button.disabled=false);
      T.feedback(q(feedbackSelector,card),'',false);
    });
    q('.check-'+level,card).addEventListener('click',()=>{
      const ok=selected.join('')===expected.join('');
      T.feedback(q(feedbackSelector,card),selected.length!==expected.length?'Використай усі теги.':ok?'Правильно! Порядок і вкладення зібрані без помилок.':'Порядок або вкладення неправильні. Спробуй ще раз.',ok);
    });
  }
  setupBuilder('level-one',['<header>','</header>','<main>','</main>','<footer>','</footer>']);
  setupBuilder('level-two',['<main>','<section>','<article>','</article>','</section>','</main>']);

  function isInside(element,parent){return !!element&&!!parent&&parent.contains(element)}
  q('.check-complex').addEventListener('click',event=>{
    const card=event.currentTarget.closest('[data-interactive]');
    const source=q('textarea',card).value;
    const doc=parse(source);
    const body=doc.body;
    const header=q('header',body),main=q('main',body),footer=q('footer',body);
    const sections=qa('section',body),articles=qa('article',body),divs=qa('div',body);
    const img=q('img',body);
    const items=[
      ['є header',!!header],['є main',!!main],['є footer',!!footer],
      ['є щонайменше 2 section',sections.length>=2],['є щонайменше 1 article',articles.length>=1],['є щонайменше 1 div',divs.length>=1],
      ['є заголовки h1, h2, h3',!!q('h1',body)&&!!q('h2',body)&&!!q('h3',body)],['є абзац',!!q('p',body)],
      ['є список ul або ol',!!q('ul,ol',body)],['є посилання з href',!!q('a[href]',body)],
      ['є зображення з непорожнім alt',!!img&&!!T.normalize(img.getAttribute('alt'))],['є strong або em',!!q('strong,em',body)],['є time',!!q('time',body)],
      ['header, main і footer — сусідні верхні блоки',header&&main&&footer&&header.parentElement===body&&main.parentElement===body&&footer.parentElement===body&&header.nextElementSibling===main&&main.nextElementSibling===footer],
      ['section розташовані в main',sections.length>=2&&sections.every(section=>isInside(section,main))],['article розташований у main',articles.length>=1&&articles.every(article=>isInside(article,main))]
    ];
    const ok=items.every(item=>item[1]);
    T.renderChecklist(q('.check-list',card),items);
    q('.preview-frame',card).srcdoc=source;
    setFeedback(card,ok?'Готово! Сторінка має повну семантичну структуру.':'Перевір позначені вимоги й доповни код.',ok);
  });
  q('.complex-task textarea').addEventListener('input',event=>{q('.preview-frame',event.currentTarget.closest('.complex-task')).srcdoc=event.currentTarget.value});

  const completed=new Set(),score=q('#final-test .score');
  qa('.check-final').forEach(button=>button.addEventListener('click',event=>{
    const card=event.currentTarget.closest('[data-interactive]');
    const result=T.checkRadio(card),id=card.dataset.test;
    if(!result.answered){completed.delete(id);setFeedback(card,'Спочатку обери відповідь.',false)}
    else{result.ok?completed.add(id):completed.delete(id);setFeedback(card,result.ok?'Правильно.':'Переглянь матеріал теми й спробуй ще раз.',result.ok)}
    score.textContent=completed.size===6?'Тему завершено! Ти вмієш будувати логічну семантичну структуру сторінки.':'Виконано правильно: '+completed.size+' / 6';
  }));
  q('#final-test').addEventListener('change',event=>{
    const card=event.target.closest('[data-test]');
    if(!card)return;
    completed.delete(card.dataset.test);
    score.textContent=completed.size?'Виконано правильно: '+completed.size+' / 6':'';
  });
})();
