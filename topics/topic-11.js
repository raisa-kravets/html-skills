(function(){
  const T=window.HTMLSkills;
  if(!T)return;
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const feedback=(root,text,ok)=>T.feedback(q('.feedback',root),text,ok);

  q('.check-radio').addEventListener('click',event=>{
    const card=event.currentTarget.closest('[data-interactive]');
    const result=T.checkRadio(card);
    feedback(card,!result.answered?'Спочатку обери відповідь.':result.ok?'Правильно. DevTools змінює лише поточне відображення сторінки.':'Спробуй ще раз. HTML-файл залишається без змін.',result.ok);
  });

  const detective=q('.detective-task');
  const optionBox=q('.detective-options',detective);
  const optionRow=q('.button-row',optionBox);
  let activeLine=null;
  const distractors=['Залишити рядок без змін','Видалити весь елемент'];
  qa('.detective-line',detective).forEach(line=>line.addEventListener('click',()=>{
    if(line.dataset.fixed==='true')return;
    activeLine=line;
    optionRow.innerHTML='';
    [line.dataset.correct,...distractors].sort(()=>Math.random()-.5).forEach(value=>{
      const button=document.createElement('button');
      button.type='button';button.textContent=value;
      button.addEventListener('click',()=>{
        if(value===activeLine.dataset.correct){activeLine.textContent=value;activeLine.dataset.fixed='true';activeLine.disabled=true;optionBox.hidden=true;const done=qa('.detective-line[data-fixed="true"]',detective).length;feedback(detective,done===3?'Усі помилки знайдено!':'Правильно. Знайди наступну помилку.',true)}
        else feedback(detective,'Спробуй ще раз.',false);
      });
      optionRow.append(button);
    });
    optionBox.hidden=false;
  }));

  const classified=new Set();
  qa('.classify-item').forEach((item,index)=>qa('button',item).forEach(button=>button.addEventListener('click',()=>{
    const ok=button.dataset.value===item.dataset.answer;
    const message=ok&&item.dataset.correction?'Правильно. Не закрита лапка після значення атрибута alt. Правильний код: '+item.dataset.correction:ok?'Правильно':'Спробуй ще раз';
    T.feedback(q('.feedback',item),message,ok);
    if(ok)classified.add(index);else classified.delete(index);
    q('.classify-task .score').textContent=classified.size===4?'Усі 4 картки виконано правильно.':'Правильно: '+classified.size+' / 4';
  })));

  const solution=`<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <title>Моя вебсторінка</title>
</head>
<body>
    <header>
        <h1>Моя вебсторінка</h1>
    </header>
    <main>
        <section>
            <h2>Про мене</h2>
            <p>Я вивчаю HTML.</p>
            <img src="images/web.jpg" alt="Вебдизайн">
            <p><strong>Мені подобається створювати сайти.</strong></p>
        </section>
    </main>
    <footer>
        <p>Навчальний проєкт</p>
    </footer>
</body>
</html>`;
  const rescue=q('.rescue-task');
  q('.show-solution',rescue).addEventListener('click',()=>{const block=q('.solution',rescue);block.textContent=solution;block.hidden=false});
  q('.check-rescue',rescue).addEventListener('click',()=>{
    const source=q('textarea',rescue).value;
    const doc=new DOMParser().parseFromString(source,'text/html');
    const h2=q('h2',doc),img=q('img',doc),strong=q('strong',doc);
    const lines=source.split(/\r?\n/).filter(Boolean);
    const indented=lines.some(line=>/^ {4}\S/.test(line));
    const items=[['заголовок h2 закрито правильно',!!h2&&h2.textContent.trim()==='Про мене'],['атрибут alt має закриті лапки',!!img&&img.getAttribute('alt')==='Вебдизайн'],['strong правильно вкладено в p',!!strong&&strong.parentElement?.tagName==='P'],['код оформлено відступами',indented]];
    const ok=items.every(x=>x[1]);
    T.renderChecklist(q('.check-list',rescue),items);
    feedback(rescue,ok?'Правильно. Тепер перевір код у W3C Validator.':'Виправ позначені пункти й спробуй ще раз.',ok);
  });
})();
