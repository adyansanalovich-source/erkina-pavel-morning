'use strict';
const cover=document.getElementById('cover'),main=document.getElementById('invitation'),openButton=document.getElementById('open');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const music=document.getElementById('wedding-music'),musicToggle=document.getElementById('music-toggle'),musicLabel=document.getElementById('music-label');
music.volume=.45;
let musicRequest=0;
function updateMusicControl(){const active=!music.paused;musicToggle.setAttribute('aria-pressed',String(active));musicToggle.setAttribute('aria-label',active?'Выключить музыку':'Включить музыку');musicLabel.textContent=active?'Музыка: вкл.':'Включить музыку';}
function playMusic(){const request=++musicRequest;const promise=music.play();if(promise)promise.then(()=>{if(request!==musicRequest)music.pause();updateMusicControl();}).catch(()=>updateMusicControl());}
function pauseMusic(){musicRequest++;music.pause();updateMusicControl();}
musicToggle.addEventListener('click',()=>music.paused?playMusic():pauseMusic());
music.addEventListener('play',updateMusicControl);music.addEventListener('pause',updateMusicControl);music.addEventListener('error',updateMusicControl);
let opening=false;
function openInvitation(){if(opening)return;opening=true;playMusic();cover.classList.add('opening');openButton.disabled=true;if(!reduced)burst();setTimeout(()=>{main.inert=false;musicToggle.hidden=false;document.body.classList.remove('sealed');document.body.classList.add('opened');cover.classList.add('dismissed');document.getElementById('names').focus({preventScroll:true});},reduced?0:1250);}
openButton.addEventListener('click',openInvitation);
document.getElementById('replay').addEventListener('click',()=>{pauseMusic();musicToggle.hidden=true;window.scrollTo({top:0,behavior:'instant'});cover.classList.remove('dismissed','opening');main.inert=true;document.body.classList.add('sealed');document.body.classList.remove('opened');opening=false;openButton.disabled=false;openButton.focus({preventScroll:true});});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));
const config=window.WEDDING||{};const id=new URLSearchParams(location.search).get('id');if(id&&Object.prototype.hasOwnProperty.call(config.guests||{},id)){const greeting=config.guests[id].greeting;if(typeof greeting==='string')document.getElementById('greeting').textContent=greeting;}
if(/^\d{4}-\d{2}-\d{2}$/.test(config.date||'')){const [y,m,d]=config.date.split('-').map(Number),date=new Date(y,m-1,d);if(date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d){const el=document.getElementById('calendar');el.hidden=false;document.getElementById('date-pending').hidden=true;const title=document.createElement('p');title.className='calendar-title';title.textContent=new Intl.DateTimeFormat('ru',{month:'long',year:'numeric'}).format(date);el.append(title);const grid=document.createElement('div');grid.className='calendar-grid';grid.setAttribute('aria-label',new Intl.DateTimeFormat('ru',{dateStyle:'long'}).format(date));['ПН','ВТ','СР','ЧТ','ПТ','СБ','ВС'].forEach(v=>{const e=document.createElement('span');e.className='weekday';e.textContent=v;grid.append(e)});for(let i=0;i<(new Date(y,m-1,1).getDay()+6)%7;i++)grid.append(document.createElement('span'));for(let n=1;n<=new Date(y,m,0).getDate();n++){const e=document.createElement('span');e.textContent=n;if(n===d){e.className='selected';e.setAttribute('aria-label',n+' — день свадьбы')}grid.append(e)}el.append(grid);}}
function burst(){const canvas=document.getElementById('sparkles'),ctx=canvas.getContext('2d');if(!ctx)return;const w=innerWidth,h=innerHeight,dpr=Math.min(devicePixelRatio||1,2);canvas.width=w*dpr;canvas.height=h*dpr;ctx.scale(dpr,dpr);const b=openButton.getBoundingClientRect(),cx=b.x+b.width/2,cy=b.y+b.height/2;const pts=Array.from({length:78},()=>{const a=Math.random()*Math.PI*2,s=35+Math.random()*180;return{x:cx,y:cy,vx:Math.cos(a)*s,vy:Math.sin(a)*s-45,r:.7+Math.random()*1.7,life:1.3+Math.random()*1.5}});const start=performance.now();function draw(now){const t=(now-start)/1000;ctx.clearRect(0,0,w,h);for(const p of pts){const alpha=Math.max(0,1-t/p.life);if(!alpha)continue;ctx.globalAlpha=alpha;ctx.fillStyle='#d9b976';ctx.shadowColor='#edcd91';ctx.shadowBlur=9;ctx.beginPath();ctx.arc(p.x+p.vx*t,p.y+p.vy*t+30*t*t,p.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;if(t<3)requestAnimationFrame(draw);else ctx.clearRect(0,0,w,h)}requestAnimationFrame(draw);}

// Shares the existing Google Sheets receiver and its supported field names.
const rsvpForm=document.getElementById('rsvp-form');
const rsvpStatus=document.getElementById('rsvp-status');
const rsvpSubmit=rsvpForm.querySelector('button[type="submit"]');
const guestDetails=document.getElementById('guest-details');
const responseId=window.crypto?.randomUUID?.()??Date.now()+'-'+Math.random().toString(16).slice(2);
let rsvpBusy=false;
function syncAttendance(){const absent=rsvpForm.elements.attendance.value==='no';guestDetails.hidden=absent;guestDetails.querySelectorAll('input,select').forEach(el=>el.disabled=absent);}
rsvpForm.addEventListener('change',syncAttendance);
rsvpForm.addEventListener('submit',async event=>{
 event.preventDefault();
 if(rsvpBusy||!rsvpForm.reportValidity())return;
 const data=Object.fromEntries(new FormData(rsvpForm));
 if(data.website)return;
 const count=data.attendance==='yes'?Number(data.guestCount||1):0;
 const companionNames=(data.companions||'').trim();
 const wishes=(data.wishes||'').trim();
 const payload={id:responseId,name:data.name.trim(),attendance:data.attendance,
 companions:[data.attendance==='yes'?'Количество гостей (включая отвечающего): '+count:'Не присутствует',companionNames?'С кем: '+companionNames:'',wishes?'Пожелания: '+wishes:''].filter(Boolean).join('\n'),
 invitation:'Утро · Кетченеры · 28.11.2026 · '+document.getElementById('greeting').textContent.replace(/\s+/g,' ').trim(),
 website:'',event:'morning-ketchenery',guestCount:count,wishes};
 if(!payload.name){rsvpForm.elements.name.setCustomValidity('Укажите ваше имя.');rsvpForm.elements.name.reportValidity();return;}
 rsvpBusy=true;rsvpSubmit.disabled=true;rsvpStatus.textContent='Отправляем ответ…';
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch(config.rsvpEndpoint,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload),signal:controller.signal});
  if(response.type!=='opaque'&&!response.ok)throw new Error('send_failed');
  // An opaque response cannot confirm a row write in the external spreadsheet.
  rsvpStatus.textContent='Ответ отправлен. Спасибо, что сообщили нам!';
  rsvpSubmit.textContent='Ответ отправлен';
 }catch(error){rsvpStatus.textContent='Не удалось подтвердить отправку. Проверьте интернет и попробуйте ещё раз.';rsvpBusy=false;rsvpSubmit.disabled=false;}
 finally{clearTimeout(timer);}
});
rsvpForm.elements.name.addEventListener('input',()=>rsvpForm.elements.name.setCustomValidity(''));
