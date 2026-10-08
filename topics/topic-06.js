(function(){
  const T=window.HTMLSkills;
  if(!T)return;
  const q=(selector,root=document)=>root.querySelector(selector);
  const bind=(selector,handler)=>{const button=q(selector);if(button&&!button.dataset.bound){button.dataset.bound='true';button.addEventListener('click',handler)}};
  const checkSelectGroup=(card,success)=>{
    const fields=[...card.querySelectorAll('select[data-answer]')];
    const feedback=q('.feedback',card);
    if(fields.some(field=>!field.value))return T.feedback(feedback,'Обери відповідь у кожному полі.',false);
    const wrong=fields.filter(field=>field.value!==field.dataset.answer).length;
    T.feedback(feedback,wrong?`Перевір ще раз: неправильних відповідей — ${wrong}.`:success,!wrong);
  };
  bind('.check-link-parts',event=>checkSelectGroup(event.currentTarget.closest('[data-interactive]'),'Правильно! Тепер ти розрізняєш тег, атрибут, адресу й видимий текст посилання.'));
  bind('.check-hrefs',event=>checkSelectGroup(event.currentTarget.closest('[data-interactive]'),'Усі адреси вибрано правильно.'));
  bind('.check-simple-link',event=>{
    const card=event.currentTarget.closest('[data-interactive]'),source=q('textarea',card).value,feedback=q('.feedback',card),result=T.checkElement(source,{tag:'a',attrs:{href:'about.html'},text:'Про місто'});
    const messages={structure:'Запиши один парний тег <a>…</a> і розмісти текст посилання між тегами.',text:'Текст між тегами має бути «Про місто».',href:'В атрибуті href укажи адресу about.html.'};
    T.feedback(feedback,result.ok?'Правильно! Посилання відкриватиме about.html.':messages[result.reason]||'Перевір запис посилання.',result.ok);
  });
  bind('.check-anchor',event=>{
    const card=event.currentTarget.closest('[data-interactive]'),id=q('[data-anchor-id]',card).value.trim(),href=q('[data-anchor-href]',card).value.trim(),feedback=q('.feedback',card);
    if(!id||!href)return T.feedback(feedback,'Заповни обидва поля: id заголовка і href посилання.',false);
    const ok=id==='history'&&href==='#history';
    T.feedback(feedback,ok?'Правильно! id записуємо без решітки, а в href перед назвою якоря ставимо #.':id!=='history'?'У полі id запиши лише history — без символу #.':'У href перед назвою history потрібен символ #.',ok);
  });
  bind('.check-external',event=>{
    const card=event.currentTarget.closest('[data-interactive]'),values=[...card.querySelectorAll('input:checked')].map(input=>input.value).sort(),feedback=q('.feedback',card),ok=values.length===2&&values[0]==='rel'&&values[1]==='target';
    T.feedback(feedback,ok?'Правильно! target="_blank" відкриває нову вкладку, а rel="noopener" робить такий перехід безпечнішим.':'Потрібні рівно два записи: один відкриває нову вкладку, інший захищає сторінку, з якої виконано перехід.',ok);
  });
  bind('.check-mail-link',event=>{
    const card=event.currentTarget.closest('[data-interactive]'),source=q('textarea',card).value,feedback=q('.feedback',card),result=T.checkElement(source,{tag:'a',attrs:{href:'mailto:student@example.com'},text:'Написати автору'});
    const messages={structure:'Збережи один парний тег <a>…</a>.',text:'Не змінюй видимий текст «Написати автору».',href:'Перед електронною адресою в href додай mailto:.'};
    T.feedback(feedback,result.ok?'Правильно! Натискання запропонує створити лист на student@example.com.':messages[result.reason]||'Перевір адресу посилання.',result.ok);
  });
  const bindProjectChoice=(selector,success,error)=>bind(selector,event=>{
    const card=event.currentTarget.closest('fieldset'),result=T.checkRadio(card),feedback=q('.feedback',card);
    if(!result.answered)return T.feedback(feedback,'Спочатку обери відповідь.',false);
    T.feedback(feedback,result.ok?success:error,result.ok);
  });
  bindProjectChoice('.check-project-href','Правильно: файли лежать в одній папці, тому достатньо відносної адреси about.html.','Укажи точне ім’я файла разом із розширенням .html.');
  bindProjectChoice('.check-project-error','Правильно: адреса має містити точне ім’я about.html.','Перевір значення href: воно має збігатися з повним іменем файла.');
  bindProjectChoice('.check-project-anchor','Правильно: у href перед значенням id ставимо символ #.','Значення href має точно повторювати id і починатися із символу #.');
})();
