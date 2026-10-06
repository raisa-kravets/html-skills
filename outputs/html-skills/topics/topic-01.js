const q=(s,c=document)=>c.querySelector(s),qa=(s,c=document)=>[...c.querySelectorAll(s)],T=window.HTMLSkills;
let step=0;const answers=['open','content','close','attr','value'],prompts=['Знайди відкривальний тег.','Знайди вміст.','Знайди закривальний тег.','Знайди назву атрибута.','Знайди значення атрибута.'];
qa('[data-p]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.p!==answers[step])return T.feedback(q('#f1'),'Спробуй ще раз. '+prompts[step],false);step++;if(step===answers.length){q('#prompt').textContent='Готово!';T.feedback(q('#f1'),'Усі ці частини разом утворюють один HTML-елемент.',true)}else{q('#prompt').textContent=(step+1)+'. '+prompts[step];T.feedback(q('#f1'),'Правильно. Ця частина виконує свою роль в HTML-елементі.',true)}}));
let pieces=[];qa('[data-piece]').forEach(b=>b.addEventListener('click',()=>{pieces.push(b.dataset.piece);b.disabled=true;q('#built').textContent=pieces.join('');if(pieces.length===3){const ok=pieces.join('')==='<p>Настільні ігри</p>';T.feedback(q('#f2'),ok?'Абзац складено правильно.':'Спочатку відкриваємо елемент, потім додаємо вміст і закриваємо елемент',ok);q('#stage2').hidden=!ok}}));
q('#reset').addEventListener('click',()=>{pieces=[];q('#built').textContent='';qa('[data-piece]').forEach(b=>b.disabled=false);q('#stage2').hidden=true;T.feedback(q('#f2'),' ',true)});
q('#checkattr').addEventListener('click',()=>{const r=T.checkElement(q('#attr').value,{tag:'p',text:'Настільні ігри',attrs:{title:'Моє захоплення'}});T.feedback(q('#f2'),r.ok?'Абзац складено правильно. Атрибут додає до нього підказку':'Атрибут записують у відкривальному тегу. Перевір його назву, значення та закривальний тег.',r.ok)});
qa('[data-check]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.check,expected=a==='a'?{tag:'h1',text:'Моя майстерня',attrs:{}}:{tag:'p',text:'Шахи',attrs:{title:'Настільна гра'}},r=T.checkElement(q('#fix'+a).value,expected),good=a==='a'?'Назви відкривального й закривального тегів відповідають одна одній.':'Атрибут записано у відкривальному тегу. Закривальний тег залишається </p>.',bad=a==='a'?'Назви відкривального й закривального тегів мають відповідати одна одній':'Атрибут записують у відкривальному тегу. Закривальний тег залишається </p>';T.feedback(q('#f3'+a),r.ok?good:bad,r.ok)}));
qa('.radio').forEach(b=>b.addEventListener('click',()=>{const f=b.closest('fieldset'),r=T.checkRadio(f),out=q('.feedback',f);if(!r.answered)return T.feedback(out,'Спочатку вибери відповідь.',false);const good=f.dataset.a==='1'?'Постійно видимий текст розташований між відкривальним і закривальним тегами.':'Ні, зміниться лише додаткова підказка. Видимий текст: Синій. Підказка: нове значення title.';T.feedback(out,r.ok?good:'Спробуй ще раз.',r.ok)}));
q('#preview').addEventListener('click',()=>T.preview(q('#frame'),q('#editor').value));q('#hint').addEventListener('click',()=>T.toggle(q('#hint'),q('#hintbox')));q('#samplebtn').addEventListener('click',()=>T.toggle(q('#samplebtn'),q('#sample')));
q('#checkcode').addEventListener('click',()=>{q('#samplebtn').disabled=false;const source=T.normalize(q('#editor').value),first=source.match(/^<h1\b[^<>]*>[\s\S]*?<\/h1\s*>/i);let ok=false;if(first){const h=T.checkElement(first[0],{tag:'h1',text:'Моя колекція',attrs:{}}),p=T.checkElement(source.slice(first[0].length).trim(),{tag:'p',text:'Я колекціоную моделі автомобілів.',attrs:{title:'Моє захоплення'}});ok=h.ok&&p.ok}T.feedback(q('#fc'),ok?'Усе правильно: є заголовок, абзац і потрібна підказка.':'Перевір заголовок, абзац, атрибут title і закривальні теги.',ok)});
q('#checkquiz').addEventListener('click',()=>{
  const explanations=[
    'Тег — частина елемента. Парний елемент містить відкривальний тег, вміст і закривальний тег.',
    'Атрибут записують у відкривальному тегу.',
    'Підказку можуть не побачити, особливо на сенсорному екрані. Важлива інформація має бути видимою.'
  ];
  let score=0;
  qa('#quizbox fieldset').forEach((fieldset,index)=>{
    const result=T.checkRadio(fieldset);
    let feedback=q('.feedback',fieldset);
    if(!feedback){feedback=document.createElement('p');feedback.className='feedback';fieldset.append(feedback)}
    if(!result.answered)T.feedback(feedback,'Відповідь не вибрано.',false);
    else if(result.ok){score++;T.feedback(feedback,'Правильно. '+explanations[index],true)}
    else T.feedback(feedback,'Неправильно. Переглянь пояснення до цього поняття та спробуй ще раз.',false);
  });
  const summary=score===3
    ?'Усі три відповіді правильні. Ти розрізняєш тег і елемент, знаєш місце атрибута та розумієш, чому важлива інформація має бути видимою.'
    :'Правильних відповідей: '+score+' із 3. Переглянь пояснення біля запитань із помилками, виправ відповіді та перевір ще раз.';
  T.feedback(q('#fq'),summary,score===3);
});
q('#projectbtn').addEventListener('click',()=>T.toggle(q('#projectbtn'),q('#projectsample')));
