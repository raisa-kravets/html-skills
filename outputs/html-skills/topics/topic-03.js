(function(){
  'use strict';
  const T=window.HTMLSkills,q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const escapeHtml=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function makeIndependentSelects(container,items,options){
    items.forEach((item,index)=>{
      const row=document.createElement('div');row.className='task-row';row.dataset.interactive='';
      row.innerHTML='<p><strong>'+(index+1)+'. '+escapeHtml(item.prompt)+'</strong></p><select class="answer-select" data-reset-feedback aria-label="Відповідь '+(index+1)+'"><option value="">Обери відповідь</option>'+options.map(value=>'<option value="'+value+'">&lt;'+value+'&gt;</option>').join('')+'</select><button type="button">Перевірити</button><p class="feedback" aria-live="polite"></p>';
      const select=q('select',row),button=q('button',row),feedback=q('.feedback',row);
      button.addEventListener('click',()=>{
        if(!select.value)return T.feedback(feedback,'Спочатку обери відповідь.',false);
        T.feedback(feedback,select.value===item.answer?item.ok:item.bad,select.value===item.answer);
      });container.append(row);
    });
  }

  makeIndependentSelects(q('#tag-situations'),[
    {prompt:'Головна назва сторінки «Моя бібліотека».',answer:'h1',ok:'Правильно: головну назву сторінки позначаємо <h1>.',bad:'Це головна тема всієї сторінки, тому потрібен заголовок першого рівня <h1>.'},
    {prompt:'Назва розділу «Пригодницькі книги».',answer:'h2',ok:'Правильно: назву основного розділу позначаємо <h2>.',bad:'Це розділ усередині сторінки, тому після головного <h1> потрібен <h2>.'},
    {prompt:'Звичайний текст про книгу.',answer:'p',ok:'Правильно: окрему думку оформлюємо абзацом <p>.',bad:'Звичайний текст — не заголовок і не розділювач. Для нього потрібен абзац <p>.'},
    {prompt:'Перейти на новий рядок усередині адреси.',answer:'br',ok:'Правильно: <br> переносить текст на новий рядок у тому самому смисловому блоці.',bad:'Адреса залишається одним смисловим блоком. Для нового рядка всередині нього потрібен <br>.'},
    {prompt:'Відокремити одну тематичну частину сторінки від іншої.',answer:'hr',ok:'Правильно: <hr> позначає тематичне розділення.',bad:'Тут змінюється тематична частина вмісту, тому доречний <hr>.'}
  ],['h1','h2','p','br','hr']);

  makeIndependentSelects(q('#hierarchy-tasks'),[
    {prompt:'Світ космосу',answer:'h1',ok:'Правильно: це головна тема сторінки — <h1>.',bad:'Це вершина всієї структури, тому потрібен <h1>.'},
    {prompt:'Планети',answer:'h2',ok:'Правильно: це основний розділ — <h2>.',bad:'Це розділ усередині головної теми, тому потрібен <h2>.'},
    {prompt:'Планети земної групи',answer:'h3',ok:'Правильно: це підрозділ розділу «Планети» — <h3>.',bad:'Ця частина вкладена в розділ «Планети», тому її рівень — <h3>.'},
    {prompt:'Планети-гіганти',answer:'h3',ok:'Правильно: це ще один підрозділ того самого рівня — <h3>.',bad:'«Планети-гіганти» рівноправні з «Планетами земної групи», тому теж потрібен <h3>.'},
    {prompt:'Зорі',answer:'h2',ok:'Правильно: це основний розділ, рівноправний із «Планетами» — <h2>.',bad:'«Зорі» та «Планети» — рівноправні основні розділи, тому обидва мають рівень <h2>.'}
  ],['h1','h2','h3','h4','h5','h6']);

  qa('.check-select').forEach(button=>button.addEventListener('click',()=>{
    const row=button.closest('[data-interactive]'),select=q('select',row),feedback=q('.feedback',row);
    if(!select.value)return T.feedback(feedback,'Спочатку обери відповідь.',false);
    const ok=select.value===select.dataset.answer;
    const message=select.dataset.answer==='br'?(ok?'Правильно: адреса — один смисловий блок, а <br> лише переносить рядок.':'Адреса є одним смисловим блоком. Її рядки поєднуємо в одному <p> за допомогою <br>.'):(ok?'Правильно: це дві окремі думки, тому кожну оформлюємо власним <p>.':'Це дві окремі думки, а не рядки одного запису. Потрібні два окремі <p>.');
    T.feedback(feedback,message,ok);
  }));

  qa('.check-fix').forEach(button=>button.addEventListener('click',()=>{
    const row=button.closest('[data-interactive]'),kind=row.dataset.fix,value=q('textarea',row).value,feedback=q('.feedback',row);let ok=false,message='';
    if(kind==='heading'){ok=T.checkElement(value,{tag:'h2',text:'Ранок',attrs:{}}).ok;message=ok?'Правильно: «Ранок» і «Навчання» — рівноправні розділи, тому обидва мають рівень h2.':'Потрібен елемент <h2>Ранок</h2>, бо «Ранок» і «Навчання» — рівноправні розділи.'}
    if(kind==='paragraph'){ok=T.checkElement(value,{tag:'p',text:'Я прокидаюся о сьомій годині.',attrs:{}}).ok;message=ok?'Правильно: абзац має і відкривальний, і закривальний тег.':'Закрий абзац тегом </p> і перевір, щоб відкривальний та закривальний теги відповідали один одному.'}
    if(kind==='hr'){ok=/^\s*<hr\s*>\s*$/i.test(value);message=ok?'Правильно: <hr> не має закривального тегу.':'Використай лише <hr>. Запис </hr> неправильний, бо цей тег не має парного закривального тегу.'}
    T.feedback(feedback,message,ok);
  }));

  function simpleSequence(source){
    let rest=T.normalize(source),result=[],match;
    const token=/^\s*(?:<(h[1-6]|p)\s*>([\s\S]*?)<\/\1\s*>|<(br|hr)\s*>)\s*/i;
    while(rest&&(match=rest.match(token))){
      const tag=(match[1]||match[3]).toLowerCase(),inner=match[2]===undefined?'':match[2];
      if(/<\/?(?:h[1-6]|p)\b/i.test(inner))return null;
      result.push({tag,text:T.compact(inner.replace(/<br\s*>/gi,'\n')),br:(inner.match(/<br\s*>/gi)||[]).length});rest=rest.slice(match[0].length);
    }
    return rest.trim()?null:result;
  }
  const sameSequence=(actual,expected)=>!!actual&&actual.length===expected.length&&actual.every((item,index)=>item.tag===expected[index].tag&&T.compact(item.text)===T.compact(expected[index].text)&&(expected[index].br===undefined||item.br===expected[index].br));
  const sameTagOrder=(actual,expected)=>!!actual&&actual.length===expected.length&&actual.every((item,index)=>item.tag===expected[index].tag);
  const sameTexts=(actual,expected)=>!!actual&&actual.length===expected.length&&actual.every((item,index)=>T.compact(item.text)===T.compact(expected[index].text)&&(expected[index].br===undefined||item.br===expected[index].br));
  function fullDocument(source,title,expectedBody){
    const doc=T.analyzeDocument(source),body=simpleSequence(doc.body||'');
    return {doc,body,ok:doc.doctype&&doc.htmlOpen&&doc.htmlClose&&doc.head!==null&&doc.headClosed&&doc.body!==null&&doc.bodyClosed&&T.hasElement(doc.head,'title',title)&&sameSequence(body,expectedBody)};
  }
  const restored=[{tag:'h1',text:'Весна'},{tag:'p',text:'Весна — пора пробудження природи.'},{tag:'h2',text:'Що змінюється навесні'},{tag:'p',text:'Дні стають довшими, а погода — теплішою.'}];
  const robotics=[{tag:'h1',text:'Клуб робототехніки'},{tag:'p',text:'У клубі учасники створюють і програмують роботів.'},{tag:'h2',text:'Розклад занять'},{tag:'p',text:'Вівторок — 16:00 Четвер — 16:00',br:1}];
  const dinosaurs=[{tag:'h1',text:'Світ динозаврів'},{tag:'p',text:'Динозаври жили на Землі мільйони років тому.'},{tag:'h2',text:'Хижі динозаври'},{tag:'p',text:'Тиранозавр був одним із найбільших наземних хижаків.'},{tag:'h3',text:'Тиранозавр'},{tag:'p',text:'Він мав потужні щелепи та гострі зуби.'},{tag:'hr',text:''},{tag:'p',text:'Після цього починається нова тематична частина.'},{tag:'h2',text:'Травоїдні динозаври'},{tag:'p',text:'Багато динозаврів харчувалися рослинами.'}];

  qa('[data-check-code]').forEach(button=>button.addEventListener('click',()=>{
    const card=button.closest('[data-interactive]'),source=q('textarea',card).value,feedback=q('.feedback',card),type=button.dataset.checkCode;let ok=false,message='';
    if(type==='restore'){ok=fullDocument(source,'Мій улюблений сезон',restored).ok;message=ok?'Усі пропуски відновлено правильно: h1, p, h2 і p стоять у потрібних місцях.':'Перевір повний каркас документа, порядок елементів і теги біля кожного готового тексту: h1, p, h2, p.'}
    if(type==='robotics'){ok=!/<\/?(?:html|head|body|title)\b/i.test(source)&&sameSequence(simpleSequence(source),robotics);message=ok?'Структуру вмісту <body> створено правильно, а рядки розкладу поєднано одним <br>.':'Потрібен лише вміст <body> у порядку h1, p, h2, p. Усередині останнього p має бути один <br> між днями.'}
    if(type==='dinosaurs'){
      const checked=fullDocument(source,'Світ динозаврів',dinosaurs),frameOk=checked.doc.doctype&&checked.doc.htmlOpen&&checked.doc.htmlClose&&checked.doc.head!==null&&checked.doc.headClosed&&checked.doc.body!==null&&checked.doc.bodyClosed,titleOk=T.hasElement(checked.doc.head,'title','Світ динозаврів'),orderOk=sameTagOrder(checked.body,dinosaurs),textsOk=sameTexts(checked.body,dinosaurs),hrOk=!!checked.body&&checked.body.filter(x=>x.tag==='hr').length===1;ok=frameOk&&titleOk&&orderOk&&textsOk&&hrOk;const list=q('.check-list',card),checks=[['Є повний каркас HTML-документа',frameOk],['У head є <title>Світ динозаврів</title>',titleOk],['У body правильна послідовність: h1, p, h2, p, h3, p, hr, p, h2, p',orderOk],['Текст кожного елемента відповідає завданню',textsOk],['Між тематичними частинами є рівно один hr',hrOk]];list.replaceChildren();checks.forEach(([text,pass])=>{const li=document.createElement('li');li.className=pass?'ok':'bad';li.textContent=(pass?'✓ ':'Потрібно виправити: ')+text;list.append(li)});if(ok)message='Повний HTML-документ має правильну структуру.';else if(!frameOk)message='Перевір каркас документа: потрібні <!DOCTYPE html>, <html>, <head> і <body> з відповідними закривальними тегами.';else if(!titleOk)message='Перевір <head>: у ньому має бути <title>Світ динозаврів</title>.';else if(!orderOk)message='Перевір порядок елементів у <body>: після <h1> має бути вступний абзац, далі <h2>, абзац, <h3> та абзац. Після <hr> має бути абзац про нову тематичну частину, потім <h2> та абзац.';else if(!textsOk)message='Структура тегів правильна, але перевір текст кожного заголовка й абзацу: він має відповідати завданню.';else message='Між двома тематичними частинами має бути рівно один <hr>.';
    }
    T.feedback(feedback,message,ok);
  }));

  const quiz=[
    {prompt:'Що означає число в тегах <h1>–<h6>?',options:['розмір тексту','колір тексту','рівень заголовка в структурі сторінки','кількість слів'],answer:2,ok:'Правильно: число показує рівень заголовка в структурі сторінки.',bad:'Рівень обирають за місцем заголовка у структурі, а не за його виглядом.'},
    {prompt:'Чи потрібно використовувати всі <h1>–<h6> на кожній сторінці?',options:['Так, усі шість рівнів обов’язкові.','Ні. Використовуємо лише ті рівні, які потрібні структурі вмісту.'],answer:1,ok:'Правильно: використовуємо лише потрібні структурі рівні.',bad:'Усі шість рівнів не обов’язкові. Структура вмісту визначає, які з них потрібні.'},
    {prompt:'Що краще для двох окремих думок?',options:['<p>...</p> <p>...</p>','<p>...<br>...</p>'],answer:0,ok:'Правильно: дві окремі думки оформлюємо двома окремими <p>.',bad:'<br> лише переносить рядок у тому самому смисловому блоці. Для двох думок потрібні два <p>.'},
    {prompt:'Для чого призначений <br>?',options:['Для великого відступу.','Для перенесення рядка без створення нового абзацу.','Для нового розділу.'],answer:1,ok:'Правильно: <br> переносить рядок без нового абзацу.',bad:'<br> не створює абзац чи відступ — він лише переносить рядок.'},
    {prompt:'У коді <h1>Мої захоплення</h1> <h5>Малювання</h5> <h5>Фотографія</h5> рівень h5 вибрано лише тому, що він виглядає меншим. Що тут не так?',options:['Нічого, розмір — головний критерій.','Потрібно вибирати рівень за структурою: для рівноправних розділів тут логічні h2.'],answer:1,ok:'Правильно: логічна структура — h1 для головної теми та h2 для двох рівноправних розділів.',bad:'Рівень заголовка визначає структура документа, а не його візуальний розмір.'}
  ];
  const quizRoot=q('#quiz-questions');quiz.forEach((item,index)=>{const field=document.createElement('fieldset');field.className='question-card';field.dataset.interactive='';field.innerHTML='<legend><strong>'+(index+1)+'. '+escapeHtml(item.prompt)+'</strong></legend>'+item.options.map((option,i)=>'<label><input type="radio" name="topic3-q'+index+'" value="'+i+'" data-reset-feedback> <span>'+escapeHtml(option)+'</span></label>').join('')+'<button type="button">Перевірити</button><p class="feedback" aria-live="polite"></p>';q('button',field).addEventListener('click',()=>{const selected=q('input:checked',field),feedback=q('.feedback',field);if(!selected)return T.feedback(feedback,'Спочатку обери відповідь.',false);const ok=Number(selected.value)===item.answer;T.feedback(feedback,ok?item.ok:item.bad,ok)});quizRoot.append(field)});
  T.clearFeedbackOnChange(document);
})();
