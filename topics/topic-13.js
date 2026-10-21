(function(){
  const T=window.HTMLSkills;
  if(!T)return;
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const tell=(root,text,ok)=>T.feedback(q('.feedback',root),text,ok);

  qa('.demo-submit').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const feedback=q('.feedback',form);if(form.checkValidity())T.feedback(feedback,'Дані пройшли навчальну перевірку. На сервер нічого не надіслано.',true)}));

  const quizzes=[['Який тег створює HTML-форму?','form',['form','input','section'],'form — контейнер усіх елементів форми.'],['Який тег створює підпис поля?','label',['span','label','input'],'label підписує поле.'],['Який тег створює пункт випадного списку?','option',['select','option','item'],'option є пунктом усередині select.'],['Який тег використовують для довгого повідомлення?','textarea',['input','textarea','p'],'textarea призначений для багаторядкового тексту.'],['Який тег створює кнопку?','button',['button','input','form'],'button створює кнопку.']];
  q('.quiz-task .touch-grid').innerHTML=quizzes.map((x,i)=>`<label class="choice-card">${x[0]}<select data-answer="${x[1]}"><option value="">Обери</option>${x[2].map(v=>`<option value="${v}">&lt;${v}&gt;</option>`).join('')}</select><small></small></label>`).join('');
  q('.check-quiz').addEventListener('click',()=>{const card=q('.quiz-task');let good=0;qa('select',card).forEach((s,i)=>{const ok=s.value===s.dataset.answer;good+=ok;q('small',s.parentElement).textContent=s.value?(ok?'Правильно. ': 'Спробуй ще. ')+quizzes[i][3]:'Обери відповідь.'});tell(card,good===quizzes.length?`Усі ${good} відповідей правильні.`:`Правильно: ${good} / ${quizzes.length}. Виправ помилки й перевір знову.`,good===quizzes.length)});

  const types=[['Уведення імені','text'],['Електронна пошта','email'],['Пароль','password'],['Вік','number'],['Дата','date'],['Один варіант із групи','radio'],['Кілька варіантів','checkbox']],typeOptions=['text','email','password','number','date','radio','checkbox'];
  q('.type-task .touch-grid').innerHTML=types.map(x=>`<label class="choice-card">${x[0]}<select data-answer="${x[1]}"><option value="">Обери type</option>${typeOptions.map(v=>`<option>${v}</option>`).join('')}</select></label>`).join('');
  q('.check-types').addEventListener('click',()=>checkSelects(q('.type-task'),'Тип поля визначає, які дані вводить або вибирає користувач.'));

  const pairs=[['type','тип поля'],['id','ідентифікатор елемента'],['for','зв’язок підпису з полем'],['name','назва даних поля'],['placeholder','підказка'],['required','обов’язкове поле'],['action','адреса надсилання даних']],meanings=pairs.map(x=>x[1]).sort(()=>.5-Math.random());
  q('.match-task .touch-grid').innerHTML=pairs.map(x=>`<label class="choice-card"><code>${x[0]}</code><select data-answer="${x[1]}"><option value="">Обери значення</option>${meanings.map(v=>`<option>${v}</option>`).join('')}</select></label>`).join('');
  q('.check-match').addEventListener('click',()=>checkSelects(q('.match-task'),'Пригадай, яку роль виконує кожен атрибут.'));
  function checkSelects(card,hint){const all=qa('select',card),answered=all.every(s=>s.value),good=all.filter(s=>s.value===s.dataset.answer).length;all.forEach(s=>s.classList.toggle('answer-wrong',!!s.value&&s.value!==s.dataset.answer));tell(card,!answered?'Заповни всі поля.':good===all.length?'Усе правильно!':`Правильно: ${good} / ${all.length}. ${hint}`,good===all.length)}

  const situations=[['Обрати один час заняття','radio','Потрібен один варіант.'],['Позначити всі програми, якими користуєшся','checkbox','Можна позначити кілька програм.'],['Обрати один рівень підготовки','radio','Рівень має бути один.'],['Позначити всі цікаві теми','checkbox','Цікавих тем може бути кілька.']];
  q('.choice-task .touch-grid').innerHTML=situations.map((x,i)=>`<div class="choice-card scenario" data-answer="${x[1]}"><p><strong>${i+1}.</strong> ${x[0]}</p><div class="button-row"><button type="button" data-value="radio">radio</button><button type="button" data-value="checkbox">checkbox</button></div><p class="feedback"></p></div>`).join('');
  const choicesDone=new Set();qa('.scenario button').forEach(button=>button.addEventListener('click',()=>{const item=button.closest('.scenario'),index=qa('.scenario').indexOf(item),ok=button.dataset.value===item.dataset.answer;ok?choicesDone.add(index):choicesDone.delete(index);T.feedback(q('.feedback',item),(ok?'Правильно. ':'Спробуй ще. ')+situations[index][2],ok);q('.choice-task .score').textContent=`Правильно: ${choicesDone.size} / ${situations.length}`}));

  q('.check-blanks').addEventListener('click',()=>{
    const card=q('.blanks-task'),values={};
    qa('[data-blank]',card).forEach(input=>{values[input.dataset.blank]=input.value.trim();input.classList.remove('answer-wrong')});
    const idValid=values.id!==''&&!/\s/.test(values.id);
    const nameValid=values.name!=='';
    const typeValid=values.type.toLowerCase()==='text';
    const forValid=values.for!==''&&values.for===values.id;
    const errors=[];
    if(!values.id)errors.push('Придумай ідентифікатор поля.');
    else if(!idValid)errors.push('Ідентифікатор id не повинен містити пробілів.');
    if(!values.name)errors.push('Додай назву даних поля.');
    if(!typeValid)errors.push('Для введення імені використовуй type="text".');
    if(!forValid)errors.push('Значення for повинно збігатися зі значенням id.');
    q('[data-blank="id"]',card).classList.toggle('answer-wrong',!idValid);
    q('[data-blank="name"]',card).classList.toggle('answer-wrong',!nameValid);
    q('[data-blank="type"]',card).classList.toggle('answer-wrong',!typeValid);
    q('[data-blank="for"]',card).classList.toggle('answer-wrong',!forValid);
    const ok=idValid&&nameValid&&typeValid&&forValid,output=q('.completed-code',card);
    output.hidden=!ok;
    if(ok)q('pre',output).textContent=`<label for="${values.for}">Ім’я:</label>\n<input type="text" id="${values.id}" name="${values.name}" required>`;
    tell(card,ok?'Правильно! Підпис пов’язано з полем, а твої назви id і name збережено.':errors.join(' '),ok);
  });

  const errorCases=[
    {code:'&lt;label for="mail"&gt;Пошта&lt;/label&gt;\n&lt;input id="email"&gt;',correct:'match-label',options:[['remove-id','Видалити id'],['match-label','Зробити for та id однаковими'],['add-placeholder','Додати placeholder']],success:'Правильно! Значення for та id мають бути однаковими, щоб підпис був пов’язаний із полем.',hint:'Порівняй значення атрибута for у label зі значенням id у input.'},
    {code:'&lt;input type="text"&gt;&lt;/input&gt;',correct:'remove-input-close',options:[['replace-with-p','Замінити input на p'],['remove-input-close','Прибрати &lt;/input&gt;'],['add-input','Додати ще один input']],success:'Правильно! Тег input не має закривального тега, тому </input> потрібно прибрати.',hint:'Пригадай: input — одиночний тег і не потребує закривального тега.'},
    {code:'&lt;textarea name="message"&gt;',correct:'close-textarea',options:[['close-textarea','Додати &lt;/textarea&gt;'],['remove-name','Видалити name'],['replace-with-label','Замінити на label']],success:'Правильно! Тег textarea парний, тому його потрібно закрити тегом </textarea>.',hint:'На відміну від input, textarea має початковий і закривальний теги.'},
    {code:'&lt;input type="radio" name="online"&gt;\n&lt;input type="radio" name="offline"&gt;',correct:'same-radio-name',options:[['add-required','Додати required'],['remove-type','Видалити type'],['same-radio-name','Задати однакове значення name']],success:'Правильно! Однакове значення name об’єднує перемикачі в одну групу.',hint:'Перемикачі однієї групи повинні мати спільне значення атрибута name.'}
  ];
  q('.error-cases').innerHTML=errorCases.map((item,index)=>`<div class="choice-card" data-error-case="${index}"><pre class="code-panel">${item.code}</pre><label>Як виправити?<select><option value="">Обери</option>${item.options.map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}</select></label><small></small></div>`).join('');
  q('.check-errors').addEventListener('click',()=>{
    const card=q('.errors-task');let good=0;
    qa('[data-error-case]',card).forEach((caseElement,index)=>{
      const item=errorCases[index],selected=q('select',caseElement).value,ok=selected===item.correct;
      if(ok)good+=1;
      q('small',caseElement).textContent=!selected?'Обери відповідь.':ok?item.success:item.hint;
    });
    tell(card,good===errorCases.length?'Усі чотири помилки виправлено правильно!':`Правильно: ${good} / ${errorCases.length}. Зміни неправильні відповіді та перевір ще раз.`,good===errorCases.length);
  });

  const lines=['<form>','<label for="name">Ім’я:</label>','<input type="text" id="name" name="name">','<button type="submit">Надіслати</button>','</form>'],selected=[],orderCard=q('.order-task'),zone=q('.assembly-zone',orderCard);
  [...lines].sort(()=>.5-Math.random()).forEach(line=>{const b=document.createElement('button');b.type='button';b.dataset.line=line;b.textContent=line;q('.piece-bank',orderCard).append(b);b.addEventListener('click',()=>{selected.push(line);b.disabled=true;zone.textContent=selected.join('\n')})});
  q('.check-order',orderCard).addEventListener('click',()=>{const ok=selected.join('\n')===lines.join('\n');tell(orderCard,ok?'Правильно: form огортає підпис, поле та кнопку.':'Почни з <form>, потім постав label, input, button і заверш </form>.',ok);q('.order-preview',orderCard).innerHTML=ok?'<div class="form-demo"><label for="order-name">Ім’я:</label><input id="order-name"><button type="button">Надіслати</button></div>':''});
  q('.reset-order',orderCard).addEventListener('click',()=>{selected.length=0;zone.textContent='';qa('.piece-bank button',orderCard).forEach(b=>b.disabled=false);q('.order-preview',orderCard).innerHTML='';tell(orderCard,'',false)});

  const build=q('.build-task'),editor=q('textarea',build),preview=q('.preview-frame',build);
  q('.update-preview',build).addEventListener('click',()=>preview.srcdoc=editor.value);
  q('.check-build',build).addEventListener('click',()=>{
    const doc=new DOMParser().parseFromString(editor.value,'text/html'),form=q('form',doc),controls=form?qa('input,select,textarea',form):[],labels=form?qa('label',form):[];
    const named=controls.length>0&&controls.every(el=>(el.getAttribute('name')||'').trim()!=='');
    const labelLinks=labels.length>0&&labels.every(label=>{const id=label.getAttribute('for');return id&&qa('[id]',form).some(el=>el.id===id)});
    const nameInput=form?q('input:not([type]), input[type="text"]',form):null,options=form?qa('select option',form):[],checks=form?qa('input[type="checkbox"]',form):[];
    const items=[['є <form>',!!form],['є обов’язкове поле імені',!!nameInput&&nameInput.hasAttribute('required')],['поля мають непорожній name',named],['label правильно зв’язані з id',labels.length>=3&&labelLinks],['є select із трьома option',!!q('select',form||doc)&&options.length===3],['є два checkbox',checks.length===2],['є textarea',!!q('textarea',form||doc)],['є button type="submit"',!!q('button[type="submit"]',form||doc)]];
    q('.status-list',build).innerHTML=items.map(x=>`<li class="${x[1]?'pass':'fail'}">${x[1]?'✓':'✗'} ${x[0]}</li>`).join('');const ok=items.every(x=>x[1]);preview.srcdoc=editor.value;tell(build,ok?'Форма виконує всі умови.':'Доповни код за пунктами, позначеними хрестиком.',ok);
  });

  const self=q('#self-check'),skillInputs=qa('.skills-checklist input[type="checkbox"]',self),skillCount=q('.skills-progress__count span',self),skillProgress=q('.skills-progress',self),skillBar=q('.skills-progress__bar',self),skillMessage=q('.skills-progress__message',self);
  function updateSkillsProgress(){const checked=skillInputs.filter(input=>input.checked).length,total=skillInputs.length;skillCount.textContent=checked;skillProgress.setAttribute('aria-valuenow',checked);skillBar.style.width=`${checked/total*100}%`;skillMessage.textContent=checked===total?'Усі вміння позначено. Можеш переходити до практичної роботи.':'Непозначені пункти підкажуть, що варто повторити.'}
  skillInputs.forEach(input=>input.addEventListener('change',updateSkillsProgress));
  updateSkillsProgress();

  const projectPreview=q('.topic-13-project-preview iframe');
  if(projectPreview)projectPreview.srcdoc=`<!doctype html><html lang="uk"><head><meta charset="utf-8"><title>Моя прогулянка Вінницею</title></head><body><section><h2>Моя прогулянка Вінницею</h2><form method="get" action=""><p><label for="visitor-name">Твоє ім’я:</label><br><input type="text" id="visitor-name" name="visitor-name" placeholder="Введи своє ім’я" required></p><p><label for="favorite-place">Яке місце Вінниці тобі найбільше сподобалося?</label><br><select id="favorite-place" name="favorite-place"><option value="tower">Вежа Артинова</option><option value="square">Європейська площа</option><option value="museum">Музей Пирогова</option></select></p><p><label for="walk-date">Дата прогулянки:</label><br><input type="date" id="walk-date" name="walk-date"></p><p>Ти вже був/була у Вінниці?</p><p><label><input type="radio" name="visited" value="yes"> Так</label> <label><input type="radio" name="visited" value="no"> Ні</label></p><p>Що тобі цікаво у Вінниці?</p><p><label><input type="checkbox" name="interests" value="history"> Історичні пам’ятки</label><br><label><input type="checkbox" name="interests" value="museums"> Музеї</label><br><label><input type="checkbox" name="interests" value="parks"> Парки та прогулянки</label></p><p><label for="impressions">Поділися враженнями:</label><br><textarea id="impressions" name="impressions" rows="4" placeholder="Напиши кілька речень"></textarea></p><button type="submit">Надіслати відгук</button></form></section></body></html>`;
})();
