(function(){
  const T=window.HTMLSkills;
  if(!T)return;
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const tell=(root,text,ok)=>T.feedback(q('.feedback',root),text,ok);

  function setupSelect(buttonSelector){
    q(buttonSelector).addEventListener('click',event=>{
      const card=event.currentTarget.closest('[data-interactive]');
      const selects=qa('select',card);
      const answered=selects.every(x=>x.value);
      const ok=answered&&selects.every(x=>x.value===x.dataset.answer);
      tell(card,!answered?'Зроби вибір у кожному полі.':ok?'Правильно.':'Перевір відповіді й спробуй ще раз.',ok);
    });
  }
  setupSelect('.check-select');
  setupSelect('.check-tags');
  setupSelect('.check-formats');

  q('.check-error').addEventListener('click',event=>{
    const card=event.currentTarget.closest('[data-interactive]');
    const selected=q('input:checked',card);
    tell(card,!selected?'Спочатку обери відповідь.':selected.value==='audio/mpeg'?'Правильно. Для MP3 потрібен type="audio/mpeg".':'Спробуй ще раз.',!!selected&&selected.value==='audio/mpeg');
  });
  const insertionDone=new Set();
  qa('.insertion-case button').forEach(button=>button.addEventListener('click',event=>{
    const item=event.currentTarget.closest('.insertion-case');
    const ok=button.dataset.value===item.dataset.answer;
    T.feedback(q('.feedback',item),ok?'Правильно. '+item.dataset.explanation:'Спробуй ще раз.',ok);
    const index=qa('.insertion-case').indexOf(item);
    ok?insertionDone.add(index):insertionDone.delete(index);
    q('.choice-task .score').textContent=insertionDone.size===3?'Усі 3 ситуації виконано правильно.':'Правильно: '+insertionDone.size+' / 3';
  }));

  const order=['<iframe','width="560"','height="315"','src="https://www.youtube.com/embed/BiESs_lMVwA"','title="Вінниця з висоти"','allowfullscreen>','</iframe>'];
  const selected=[];
  const orderCard=q('.order-task'),zone=q('.assembly-zone',orderCard);
  qa('[data-piece]',orderCard).forEach(button=>button.addEventListener('click',()=>{selected.push(button.dataset.piece);button.disabled=true;zone.textContent=selected.join('\n')}));
  q('.check-order',orderCard).addEventListener('click',()=>tell(orderCard,selected.join('|')===order.join('|')?'Правильно. YouTube-вставку зібрано.':'Перевір порядок фрагментів.',selected.join('|')===order.join('|')));
  q('.reset-order',orderCard).addEventListener('click',()=>{selected.length=0;zone.textContent='';qa('[data-piece]',orderCard).forEach(x=>x.disabled=false);tell(orderCard,'',false)});

  q('.check-media-code').addEventListener('click',event=>{
    const card=event.currentTarget.closest('[data-interactive]');
    const doc=new DOMParser().parseFromString(q('textarea',card).value,'text/html');
    const video=q('video',doc),audio=q('audio',doc),sections=qa('section',doc);
    const videoSources=video?qa('source',video):[],audioSources=audio?qa('source',audio):[];
    const hasSource=(sources,file,type)=>sources.some(x=>x.getAttribute('src')===file&&x.getAttribute('type')===type);
    const items=[['є h1 «Моя медіатека»',q('h1',doc)?.textContent.trim()==='Моя медіатека'],['є два section',sections.length>=2],['є h2 «Відео»',qa('h2',doc).some(x=>x.textContent.trim()==='Відео')],['є video з controls',!!video&&video.hasAttribute('controls')],['підключено video.mp4 з type="video/mp4"',hasSource(videoSources,'video.mp4','video/mp4')],['підключено video.webm з type="video/webm"',hasSource(videoSources,'video.webm','video/webm')],['є h2 «Аудіо»',qa('h2',doc).some(x=>x.textContent.trim()==='Аудіо')],['є audio з controls',!!audio&&audio.hasAttribute('controls')],['підключено audio.mp3 з type="audio/mpeg"',hasSource(audioSources,'audio.mp3','audio/mpeg')]];
    const ok=items.every(x=>x[1]);T.renderChecklist(q('.check-list',card),items);tell(card,ok?'Медіасторінка має всі потрібні елементи.':'Доповни код за позначеними вимогами.',ok);
  });

  q('.check-youtube').addEventListener('click',event=>{
    const card=event.currentTarget.closest('[data-interactive]');
    const source=q('textarea',card).value;
    const doc=new DOMParser().parseFromString(source,'text/html');
    const frame=q('iframe',doc);
    const ok=!!frame&&/youtube\.com\/embed\/ZDSTYYW0Lr4/.test(frame.src)&&frame.hasAttribute('allowfullscreen');
    q('.preview-frame',card).srcdoc=source;
    tell(card,ok?'Правильно. Відео «Топ місць у Вінниці» вбудовано.':'Встав повний код iframe, отриманий через «Поділитися» → «Вставити».',ok);
  });

  const selfDone=new Set();
  qa('.check-self').forEach((button,index)=>button.addEventListener('click',event=>{
    const row=event.currentTarget.closest('.task-row'),picked=q('input:checked',row),ok=!!picked&&picked.value===row.dataset.answer;
    ok?selfDone.add(index):selfDone.delete(index);tell(row,!picked?'Спочатку обери відповідь.':ok?'Правильно.':'Спробуй ще раз.',ok);updateScore();
  }));
  q('.check-self-select').addEventListener('click',event=>{const row=event.currentTarget.closest('.task-row'),ok=q('select',row).value===row.dataset.answer;ok?selfDone.add(2):selfDone.delete(2);tell(row,ok?'Правильно.':'Спробуй ще раз.',ok);updateScore()});
  function updateScore(){q('#self-check .score').textContent=selfDone.size===3?'Перевірку завершено!':'Правильно: '+selfDone.size+' / 3'}

  const indexPreview=`<!doctype html><html lang="uk"><head><meta charset="utf-8"><style>body{margin:0;color:#111d36;font:16px Arial,sans-serif}header{padding:18px 7%;border-bottom:3px solid #d7193f;display:flex;justify-content:space-between;align-items:center}header strong{font-size:28px;color:#d7193f}nav a{margin-left:22px;color:#111d36;text-decoration:none;font-weight:700}main{max-width:900px;margin:auto;padding:28px}h1{font-size:38px}section{padding:22px 0;border-bottom:1px solid #ddd}.media-row{display:grid;grid-template-columns:minmax(0,2fr) minmax(220px,1fr);gap:18px}.media-row>div{min-width:0}.media-row iframe{width:100%;aspect-ratio:16/9;height:auto;border:0}.audio-card{padding:18px;border:1px solid #d7dfeb;border-radius:10px}.audio-card h3{margin-top:0}.audio-card audio{width:100%}footer{padding:22px 7%;background:#182238;color:#fff;display:flex;justify-content:space-between}@media(max-width:700px){.media-row{grid-template-columns:1fr}}</style></head><body><header><strong>Вінниця.</strong><nav><a>Головна</a><a>Про місто</a><a>Місця</a><a>Маршрут</a></nav></header><main><h1>Моє місто — Вінниця</h1><p>Вінниця — місто в Україні, розташоване на берегах Південного Бугу.</p><section><h2>Коротко про Вінницю</h2><p>Місто має давню історію та поєднує історичну забудову із сучасними просторами.</p></section><section><h2>Що варто побачити у Вінниці</h2><p>Вежа Артинова, Європейська площа, музей Пирогова та Вінницькі мури.</p></section><section><h2>Побачити й почути місто</h2><div class="media-row"><div><iframe src="https://www.youtube.com/embed/BiESs_lMVwA" title="Вінниця з висоти пташиного польоту" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div><div class="audio-card"><h3>Аудіорозповідь</h3><audio controls><source src="audio/vinnytsia.mp3" type="audio/mpeg">Ваш браузер не підтримує відтворення аудіо.</audio></div></div></section></main><footer><address>Навчальний автор<br>student@example.com</address><p>Сторінку оновлено: 1 жовтня 2026 року</p></footer></body></html>`;
  q('.project-index-preview').srcdoc=indexPreview;
})();
