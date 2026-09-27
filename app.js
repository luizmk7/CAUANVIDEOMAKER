const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveal animation observer
const observer=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    e.target.classList.add('visible');
    observer.unobserve(e.target);
  }
}),{threshold:.08});

$$('.intro-kicker,.intro h2,.intro-desc,.stat-box,.portfolio-hub,.category-block,.services>div,.formats-header,.formats-footer,.process h2,.feedback h2,.faq>div,.contact>div').forEach(el=>{
  el.classList.add('reveal');
  observer.observe(el);
});

// Automatic Count-Up Counter Animation for Hero and Stats
function initCounters(){
  const counters=$$('.counter');
  if(!counters.length)return;
  const countObs=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el=entry.target;
        countObs.unobserve(el);
        const target=parseFloat(el.dataset.target||el.textContent.replace(/[^0-9.]/g,''))||0;
        const prefix=el.dataset.prefix||'';
        const suffix=el.dataset.suffix||(el.textContent.includes('+')?'+':(el.textContent.includes('%')?'%':''));
        if(paused){
          const fVal=prefix&&target<10?prefix+target:target;
          el.textContent=`${fVal}${suffix}`;
          return;
        }
        const duration=1600;
        const start=performance.now();
        function step(now){
          const elapsed=now-start;
          const p=Math.min(1,elapsed/duration);
          const ease=1-Math.pow(1-p,3);
          const current=Math.round(ease*target);
          const display=prefix&&current<10?prefix+current:current;
          el.textContent=`${display}${suffix}`;
          if(p<1){
            requestAnimationFrame(step);
          }else{
            const fVal=prefix&&target<10?prefix+target:target;
            el.textContent=`${fVal}${suffix}`;
          }
        }
        requestAnimationFrame(step);
      }
    });
  },{threshold:.2});
  counters.forEach(c=>countObs.observe(c));
}
initCounters();

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
let ticking=false;
const journey=$('.gear-journey');
const stage=$('.gear-stage');

function render(){
  const max=document.documentElement.scrollHeight-innerHeight;
  const progressEl=$('.progress');
  if(progressEl)progressEl.style.transform=`scaleX(${max>0?scrollY/max:0})`;
  if(!paused){
    const heroSec=$('.hero-section')||$('.hero');
    if(heroSec){
      const hp=clamp(scrollY/Math.max(1,heroSec.offsetHeight));
      const portrait=$('.hero-portrait-cutout');
      if(portrait)portrait.style.transform=`translateY(${hp*35}px)`;
    }
    const intro=$('.intro');
    if(intro){
      const ir=intro.getBoundingClientRect();
      const ip=clamp((innerHeight*.65-ir.top)/(innerHeight*.52));
      const words=$$('.word');
      const total=words.length||1;
      words.forEach((w,i)=>{
        const n=clamp((ip*(total+0.3)-i)/1.1);
        w.style.setProperty('--fill',`${n*100}%`);
      });
    }
    if(journey&&stage){
      const r=journey.getBoundingClientRect();
      const gp=clamp(-r.top/Math.max(1,journey.offsetHeight-stage.offsetHeight));
      stage.style.setProperty('--journey',gp);
      stage.style.setProperty('--wipe',`${100-clamp(gp*1.8)*100}%`);
      const isDarkPhase = gp >= 0.24;
      stage.classList.toggle('is-dark-phase', isDarkPhase);
      const gearImg=$('.gear-camera-visual img')||$('.gear-visual img');
      if(gearImg)gearImg.style.transform=`translateY(${(gp-.5)*-30}px) rotate(${gp*16-8}deg) scale(${0.96-gp*.04})`;
      const phoneImg=$('.gear-phone-visual img');
      if(phoneImg && isDarkPhase){
        const darkProg = clamp((gp - 0.24) / 0.76);
        phoneImg.style.transform = `translateY(${(darkProg - .5) * -20}px) rotate(${darkProg * 8 - 4}deg)`;
      }
      const gearIntro=$('.gear-intro-block')||$('.gear-title');
      if(gearIntro){
        gearIntro.style.transform=`translateY(${-gp*50}px)`;
        gearIntro.style.opacity=1-clamp((gp-.2)*2.2);
      }
      const gearCopy=$('.gear-copy');
      if(gearCopy){
        gearCopy.inert=gp<.25;
        gearCopy.style.opacity=clamp((gp-.22)*3);
        gearCopy.style.transform=`translateY(${(1-clamp((gp-.22)*3))*30}px)`;
      }
    }
  }
  ticking=false;
}

function queueRender(){if(!ticking){requestAnimationFrame(render);ticking=true}}
addEventListener('scroll',queueRender,{passive:true});
addEventListener('resize',queueRender);

function motionState(){
  document.body.classList.toggle('paused',paused);
  const motionBtn=$('#motion');
  if(motionBtn){
    motionBtn.textContent=paused?'Ativar movimentos ▷':'Pausar movimentos Ⅱ';
    motionBtn.setAttribute('aria-pressed',String(paused));
  }
  if(paused){
    const gearCopy=$('.gear-copy');
    if(gearCopy)gearCopy.inert=false;
    $$('.gear-camera-visual img,.gear-phone-visual img,.gear-visual img,.hero-portrait-cutout,.gear-title,.gear-copy').forEach(x=>{
      if(x){x.style.transform='';x.style.filter='';x.style.opacity='';}
    });
  }
  render();
  window.dispatchEvent(new CustomEvent('cauan:motion', {detail:{paused}}));
}

const motionBtn=$('#motion');
if(motionBtn)motionBtn.addEventListener('click',()=>{paused=!paused;motionState()});
motionState();

// Dialog modal for photos and videos preview
const dialog=$('#gallery');
let lastFocusedElement=null;

function openModal(data, triggerEl){
  if(!dialog)return;
  lastFocusedElement=triggerEl||document.activeElement;
  const img=$('#modal-img');
  const vidBox=$('#modal-video-box');
  const vid=$('#modal-video');
  const titleEl=$('#modal-title');
  const catEl=$('#modal-cat');
  const typeEl=$('#modal-type');
  const descEl=$('#modal-desc');
  const extLink=$('#modal-ext-link');

  if(catEl)catEl.textContent=data.category||'PORTFÓLIO';
  if(titleEl)titleEl.textContent=data.title||'';
  if(descEl)descEl.textContent=data.caption||'Registro de trabalho por Cauan.';

  if(data.mediaType==='video'&&data.videoSrc){
    if(img)img.hidden=true;
    if(vidBox)vidBox.hidden=false;
    if(vid){
      vid.src=data.videoSrc;
      vid.load();
    }
    if(typeEl)typeEl.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg><span>Vídeo</span>';
  }else{
    if(vidBox)vidBox.hidden=true;
    if(vid){
      vid.pause();
      vid.removeAttribute('src');
      vid.load();
    }
    if(img){
      img.hidden=false;
      img.src=data.image||'';
      img.alt=data.title||'Trabalho do portfólio de Cauan';
    }
    if(typeEl)typeEl.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg><span>Fotografia</span>';
  }

  if(extLink){
    const arrowSvg = '<svg class="ui-arrow" viewBox="0 0 10 10" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 8L8 2M8 2H3.5M8 2V6.5"/></svg>';
    if(data.link){
      extLink.href=data.link;
      extLink.innerHTML=`Ver este trabalho ${arrowSvg}`;
    }else{
      extLink.href='https://www.instagram.com/cauanvideomaker_/';
      extLink.innerHTML=`Ver mais no Instagram ${arrowSvg}`;
    }
  }

  dialog.showModal();
  document.body.style.overflow='hidden';
  if(data.mediaType==='video'&&data.videoSrc&&vid){
    vid.play().catch(e=>console.log('Autoplay handled:', e));
  }
}

function closeModal(){
  if(!dialog||!dialog.open)return;
  const vid=$('#modal-video');
  if(vid){
    vid.pause();
    vid.removeAttribute('src');
    vid.load();
  }
  dialog.close();
  document.body.style.overflow='';
  if(lastFocusedElement&&typeof lastFocusedElement.focus==='function'){
    lastFocusedElement.focus();
  }
}

if(dialog){
  const closeBtn=dialog.querySelector('.close');
  if(closeBtn)closeBtn.addEventListener('click',closeModal);
  dialog.addEventListener('close',()=>{
    document.body.style.overflow='';
    const vid=$('#modal-video');
    if(vid){
      vid.pause();
      vid.removeAttribute('src');
    }
    if(lastFocusedElement&&typeof lastFocusedElement.focus==='function'){
      lastFocusedElement.focus();
    }
  });
  dialog.addEventListener('click',e=>{
    if(e.target===dialog){
      const r=dialog.getBoundingClientRect();
      if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom){
        closeModal();
      }
    }
  });
  dialog.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      e.preventDefault();
      closeModal();
    }
  });
}

// ============================================================
// GALERIA EXPANDIDA POR CATEGORIA (MODAL DE MAIS FOTOS)
// ============================================================
// Catálogo de fotos integrado (Garante funcionamento 100% autônomo e à prova de falhas na publicação)
const BUILTIN_PORTFOLIO = {"aniversarios": [{"src": "assets/portfolio/aniversarios/aniversarios-001.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-001-thumb.webp", "alt": "Debutante com vestido prateado diante de um painel verde", "title": "Debutante com vestido prateado diante de um painel verde", "caption": "Debutante com vestido prateado diante de um painel verde."}, {"src": "assets/portfolio/aniversarios/aniversarios-002.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-002-thumb.webp", "alt": "Debutante com vestido rosa durante a homenagem da família", "title": "Debutante com vestido rosa durante a homenagem da família", "caption": "Debutante com vestido rosa durante a homenagem da família."}, {"src": "assets/portfolio/aniversarios/aniversarios-003.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-003-thumb.webp", "alt": "Debutante de vestido rosa subindo a escadaria", "title": "Debutante de vestido rosa subindo a escadaria", "caption": "Debutante de vestido rosa subindo a escadaria."}, {"src": "assets/portfolio/aniversarios/aniversarios-004.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-004-thumb.webp", "alt": "Homenagem à debutante durante a festa", "title": "Homenagem à debutante durante a festa", "caption": "Homenagem à debutante durante a festa."}, {"src": "assets/portfolio/aniversarios/aniversarios-005.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-005-thumb.webp", "alt": "Debutante abraçada a familiares", "title": "Debutante abraçada a familiares", "caption": "Debutante abraçada a familiares."}, {"src": "assets/portfolio/aniversarios/aniversarios-006.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-006-thumb.webp", "alt": "Debutante emocionada durante a homenagem", "title": "Debutante emocionada durante a homenagem", "caption": "Debutante emocionada durante a homenagem."}, {"src": "assets/portfolio/aniversarios/aniversarios-007.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-007-thumb.webp", "alt": "Amigos reunidos na escadaria da festa", "title": "Amigos reunidos na escadaria da festa", "caption": "Amigos reunidos na escadaria da festa."}, {"src": "assets/portfolio/aniversarios/aniversarios-008.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-008-thumb.webp", "alt": "Valsa da debutante com vestido rosa", "title": "Valsa da debutante com vestido rosa", "caption": "Valsa da debutante com vestido rosa."}, {"src": "assets/portfolio/aniversarios/aniversarios-009.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-009-thumb.webp", "alt": "Retrato da debutante de vestido rosa na escadaria", "title": "Retrato da debutante de vestido rosa na escadaria", "caption": "Retrato da debutante de vestido rosa na escadaria."}, {"src": "assets/portfolio/aniversarios/aniversarios-010.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-010-thumb.webp", "alt": "Debutante sentada na escadaria", "title": "Debutante sentada na escadaria", "caption": "Debutante sentada na escadaria."}, {"src": "assets/portfolio/aniversarios/aniversarios-011.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-011-thumb.webp", "alt": "Debutante reunida com as amigas", "title": "Debutante reunida com as amigas", "caption": "Debutante reunida com as amigas."}, {"src": "assets/portfolio/aniversarios/aniversarios-012.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-012-thumb.webp", "alt": "Detalhes do vestido rosa da debutante", "title": "Detalhes do vestido rosa da debutante", "caption": "Detalhes do vestido rosa da debutante."}, {"src": "assets/portfolio/aniversarios/aniversarios-013.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-013-thumb.webp", "alt": "Debutante de vestido rosa diante do espelho", "title": "Debutante de vestido rosa diante do espelho", "caption": "Debutante de vestido rosa diante do espelho."}, {"src": "assets/portfolio/aniversarios/aniversarios-014.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-014-thumb.webp", "alt": "Abraço entre a debutante e sua mãe", "title": "Abraço entre a debutante e sua mãe", "caption": "Abraço entre a debutante e sua mãe."}, {"src": "assets/portfolio/aniversarios/aniversarios-015.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-015-thumb.webp", "alt": "Debutante sentada com o vestido rosa aberto", "title": "Debutante sentada com o vestido rosa aberto", "caption": "Debutante sentada com o vestido rosa aberto."}, {"src": "assets/portfolio/aniversarios/aniversarios-016.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-016-thumb.webp", "alt": "Família reunida na festa de 15 anos", "title": "Família reunida na festa de 15 anos", "caption": "Família reunida na festa de 15 anos."}, {"src": "assets/portfolio/aniversarios/aniversarios-017.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-017-thumb.webp", "alt": "Retrato da debutante com vestido prateado", "title": "Retrato da debutante com vestido prateado", "caption": "Retrato da debutante com vestido prateado."}, {"src": "assets/portfolio/aniversarios/aniversarios-018.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-018-thumb.webp", "alt": "Amigas dançando na festa de 15 anos", "title": "Amigas dançando na festa de 15 anos", "caption": "Amigas dançando na festa de 15 anos."}, {"src": "assets/portfolio/aniversarios/aniversarios-019.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-019-thumb.webp", "alt": "Preparação da debutante com sua mãe", "title": "Preparação da debutante com sua mãe", "caption": "Preparação da debutante com sua mãe."}, {"src": "assets/portfolio/aniversarios/aniversarios-020.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-020-thumb.webp", "alt": "Retrato da debutante diante de um painel verde", "title": "Retrato da debutante diante de um painel verde", "caption": "Retrato da debutante diante de um painel verde."}, {"src": "assets/portfolio/aniversarios/aniversarios-021.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-021-thumb.webp", "alt": "Amigas fazendo uma selfie na festa", "title": "Amigas fazendo uma selfie na festa", "caption": "Amigas fazendo uma selfie na festa."}, {"src": "assets/portfolio/aniversarios/aniversarios-022.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-022-thumb.webp", "alt": "Debutante sorrindo durante a preparação", "title": "Debutante sorrindo durante a preparação", "caption": "Debutante sorrindo durante a preparação."}, {"src": "assets/portfolio/aniversarios/aniversarios-023.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-023-thumb.webp", "alt": "Abraço entre a debutante e seu pai", "title": "Abraço entre a debutante e seu pai", "caption": "Abraço entre a debutante e seu pai."}, {"src": "assets/portfolio/aniversarios/aniversarios-024.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-024-thumb.webp", "alt": "Debutante recebendo flores", "title": "Debutante recebendo flores", "caption": "Debutante recebendo flores."}, {"src": "assets/portfolio/aniversarios/aniversarios-025.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-025-thumb.webp", "alt": "Debutante com amigas e convidadas", "title": "Debutante com amigas e convidadas", "caption": "Debutante com amigas e convidadas."}, {"src": "assets/portfolio/aniversarios/aniversarios-026.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-026-thumb.webp", "alt": "Família reunida durante as homenagens", "title": "Família reunida durante as homenagens", "caption": "Família reunida durante as homenagens."}, {"src": "assets/portfolio/aniversarios/aniversarios-027.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-027-thumb.webp", "alt": "Making of da debutante em preto e branco", "title": "Making of da debutante em preto e branco", "caption": "Making of da debutante em preto e branco."}, {"src": "assets/portfolio/aniversarios/aniversarios-028.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-028-thumb.webp", "alt": "Homenagem da família à debutante", "title": "Homenagem da família à debutante", "caption": "Homenagem da família à debutante."}, {"src": "assets/portfolio/aniversarios/aniversarios-029.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-029-thumb.webp", "alt": "Vestido rosa da debutante visto de costas", "title": "Vestido rosa da debutante visto de costas", "caption": "Vestido rosa da debutante visto de costas."}, {"src": "assets/portfolio/aniversarios/aniversarios-030.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-030-thumb.webp", "alt": "Retrato da debutante de robe em preto e branco", "title": "Retrato da debutante de robe em preto e branco", "caption": "Retrato da debutante de robe em preto e branco."}, {"src": "assets/portfolio/aniversarios/aniversarios-031.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-031-thumb.webp", "alt": "Maquiagem da debutante durante a preparação", "title": "Maquiagem da debutante durante a preparação", "caption": "Maquiagem da debutante durante a preparação."}, {"src": "assets/portfolio/aniversarios/aniversarios-032.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-032-thumb.webp", "alt": "Sandálias escolhidas para a festa de 15 anos", "title": "Sandálias escolhidas para a festa de 15 anos", "caption": "Sandálias escolhidas para a festa de 15 anos."}, {"src": "assets/portfolio/aniversarios/aniversarios-033.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-033-thumb.webp", "alt": "Detalhes dos produtos de maquiagem no making of", "title": "Detalhes dos produtos de maquiagem no making of", "caption": "Detalhes dos produtos de maquiagem no making of."}, {"src": "assets/portfolio/aniversarios/aniversarios-034.webp", "thumbnail": "assets/portfolio/aniversarios/aniversarios-034-thumb.webp", "alt": "Amigas celebrando na pista de dança", "title": "Amigas celebrando na pista de dança", "caption": "Amigas celebrando na pista de dança."}], "casamentos": [{"src": "assets/portfolio/casamentos/casamentos-044.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-044-thumb.webp", "alt": "Noivos abraçados no jardim à noite", "title": "Noivos abraçados no jardim à noite", "caption": "Noivos abraçados no jardim à noite."}, {"src": "assets/portfolio/casamentos/casamentos-048.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-048-thumb.webp", "alt": "Noivos no jardim em fotografia preto e branco", "title": "Noivos no jardim em fotografia preto e branco", "caption": "Noivos no jardim em fotografia preto e branco."}, {"src": "assets/portfolio/casamentos/casamentos-049.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-049-thumb.webp", "alt": "Noiva de vestido branco na escadaria", "title": "Noiva de vestido branco na escadaria", "caption": "Noiva de vestido branco na escadaria."}, {"src": "assets/portfolio/casamentos/casamentos-050.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-050-thumb.webp", "alt": "Porta-alianças e detalhes do casamento", "title": "Porta-alianças e detalhes do casamento", "caption": "Porta-alianças e detalhes do casamento."}, {"src": "assets/portfolio/casamentos/casamentos-051.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-051-thumb.webp", "alt": "Noiva durante o making of em preto e branco", "title": "Noiva durante o making of em preto e branco", "caption": "Noiva durante o making of em preto e branco."}, {"src": "assets/portfolio/casamentos/casamentos-052.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-052-thumb.webp", "alt": "Sapatos e porta-alianças do casamento", "title": "Sapatos e porta-alianças do casamento", "caption": "Sapatos e porta-alianças do casamento."}, {"src": "assets/portfolio/casamentos/casamentos-054.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-054-thumb.webp", "alt": "Beijo dos noivos em preto e branco", "title": "Beijo dos noivos em preto e branco", "caption": "Beijo dos noivos em preto e branco."}, {"src": "assets/portfolio/casamentos/casamentos-055.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-055-thumb.webp", "alt": "Noivos juntos no jardim", "title": "Noivos juntos no jardim", "caption": "Noivos juntos no jardim."}, {"src": "assets/portfolio/casamentos/casamentos-057.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-057-thumb.webp", "alt": "Detalhe do terço nas mãos da noiva", "title": "Detalhe do terço nas mãos da noiva", "caption": "Detalhe do terço nas mãos da noiva."}, {"src": "assets/portfolio/casamentos/casamentos-058.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-058-thumb.webp", "alt": "Ajustes finais do vestido da noiva", "title": "Ajustes finais do vestido da noiva", "caption": "Ajustes finais do vestido da noiva."}, {"src": "assets/portfolio/casamentos/casamentos-067.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-067-thumb.webp", "alt": "Noiva com vestido e véu durante a preparação", "title": "Noiva com vestido e véu durante a preparação", "caption": "Noiva com vestido e véu durante a preparação."}, {"src": "assets/portfolio/casamentos/casamentos-068.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-068-thumb.webp", "alt": "Noivos durante a cerimônia ao ar livre", "title": "Noivos durante a cerimônia ao ar livre", "caption": "Noivos durante a cerimônia ao ar livre."}, {"src": "assets/portfolio/casamentos/casamentos-069.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-069-thumb.webp", "alt": "Noivos com buquê e homenagem em porta-retrato", "title": "Noivos com buquê e homenagem em porta-retrato", "caption": "Noivos com buquê e homenagem em porta-retrato."}, {"src": "assets/portfolio/casamentos/casamentos-072.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-072-thumb.webp", "alt": "Retrato da noiva com véu", "title": "Retrato da noiva com véu", "caption": "Retrato da noiva com véu."}, {"src": "assets/portfolio/casamentos/casamentos-077.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-077-thumb.webp", "alt": "Noiva segurando buquê de flores brancas", "title": "Noiva segurando buquê de flores brancas", "caption": "Noiva segurando buquê de flores brancas."}, {"src": "assets/portfolio/casamentos/casamentos-079.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-079-thumb.webp", "alt": "Noiva observando o vestido durante o making of", "title": "Noiva observando o vestido durante o making of", "caption": "Noiva observando o vestido durante o making of."}, {"src": "assets/portfolio/casamentos/casamentos-082.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-082-thumb.webp", "alt": "Beijo dos noivos entre luzes de festa", "title": "Beijo dos noivos entre luzes de festa", "caption": "Beijo dos noivos entre luzes de festa."}, {"src": "assets/portfolio/casamentos/casamentos-083.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-083-thumb.webp", "alt": "Noivos caminhando entre convidados e luzes", "title": "Noivos caminhando entre convidados e luzes", "caption": "Noivos caminhando entre convidados e luzes."}, {"src": "assets/portfolio/casamentos/casamentos-084.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-084-thumb.webp", "alt": "Saída dos noivos com luzes e convidados", "title": "Saída dos noivos com luzes e convidados", "caption": "Saída dos noivos com luzes e convidados."}, {"src": "assets/portfolio/casamentos/casamentos-088.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-088-thumb.webp", "alt": "Entrada da noiva acompanhada até o altar", "title": "Entrada da noiva acompanhada até o altar", "caption": "Entrada da noiva acompanhada até o altar."}, {"src": "assets/portfolio/casamentos/casamentos-089.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-089-thumb.webp", "alt": "Noivos trocando votos ao ar livre", "title": "Noivos trocando votos ao ar livre", "caption": "Noivos trocando votos ao ar livre."}, {"src": "assets/portfolio/casamentos/casamentos-090.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-090-thumb.webp", "alt": "Cerimônia de casamento no jardim", "title": "Cerimônia de casamento no jardim", "caption": "Cerimônia de casamento no jardim."}, {"src": "assets/portfolio/casamentos/casamentos-091.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-091-thumb.webp", "alt": "Noivo beijando a testa da noiva", "title": "Noivo beijando a testa da noiva", "caption": "Noivo beijando a testa da noiva."}, {"src": "assets/portfolio/casamentos/casamentos-095.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-095-thumb.webp", "alt": "Casamento ao ar livre ao entardecer", "title": "Casamento ao ar livre ao entardecer", "caption": "Casamento ao ar livre ao entardecer."}, {"src": "assets/portfolio/casamentos/casamentos-101.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-101-thumb.webp", "alt": "Noiva entrando acompanhada em preto e branco", "title": "Noiva entrando acompanhada em preto e branco", "caption": "Noiva entrando acompanhada em preto e branco."}, {"src": "assets/portfolio/casamentos/casamentos-103.webp", "thumbnail": "assets/portfolio/casamentos/casamentos-103-thumb.webp", "alt": "Ajustes finais do vestido da noiva", "title": "Ajustes finais do vestido da noiva", "caption": "Ajustes finais do vestido da noiva."}], "formaturas": [{"src": "assets/portfolio/formaturas/formaturas-035.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-035-thumb.webp", "alt": "Formanda de beca preta e faixa verde", "title": "Formanda de beca preta e faixa verde", "caption": "Formanda de beca preta e faixa verde."}, {"src": "assets/portfolio/formaturas/formaturas-036.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-036-thumb.webp", "alt": "Formanda sentada junto à iluminação da festa", "title": "Formanda sentada junto à iluminação da festa", "caption": "Formanda sentada junto à iluminação da festa."}, {"src": "assets/portfolio/formaturas/formaturas-042.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-042-thumb.webp", "alt": "Formandas levantando os capelos durante a colação", "title": "Formandas levantando os capelos durante a colação", "caption": "Formandas levantando os capelos durante a colação."}, {"src": "assets/portfolio/formaturas/formaturas-043.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-043-thumb.webp", "alt": "Turma de formandos reunida para uma fotografia", "title": "Turma de formandos reunida para uma fotografia", "caption": "Turma de formandos reunida para uma fotografia."}, {"src": "assets/portfolio/formaturas/formaturas-045.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-045-thumb.webp", "alt": "Formanda de vestido verde na pista de dança", "title": "Formanda de vestido verde na pista de dança", "caption": "Formanda de vestido verde na pista de dança."}, {"src": "assets/portfolio/formaturas/formaturas-046.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-046-thumb.webp", "alt": "Formanda com canudo e vestido verde", "title": "Formanda com canudo e vestido verde", "caption": "Formanda com canudo e vestido verde."}, {"src": "assets/portfolio/formaturas/formaturas-047.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-047-thumb.webp", "alt": "Formanda celebrando com óculos de festa", "title": "Formanda celebrando com óculos de festa", "caption": "Formanda celebrando com óculos de festa."}, {"src": "assets/portfolio/formaturas/formaturas-053.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-053-thumb.webp", "alt": "Formandas celebrando no baile", "title": "Formandas celebrando no baile", "caption": "Formandas celebrando no baile."}, {"src": "assets/portfolio/formaturas/formaturas-056.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-056-thumb.webp", "alt": "Retrato de formanda com beca e canudo", "title": "Retrato de formanda com beca e canudo", "caption": "Retrato de formanda com beca e canudo."}, {"src": "assets/portfolio/formaturas/formaturas-059.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-059-thumb.webp", "alt": "Retrato durante a celebração religiosa da formatura", "title": "Retrato durante a celebração religiosa da formatura", "caption": "Retrato durante a celebração religiosa da formatura."}, {"src": "assets/portfolio/formaturas/formaturas-060.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-060-thumb.webp", "alt": "Formanda de vestido verde no baile", "title": "Formanda de vestido verde no baile", "caption": "Formanda de vestido verde no baile."}, {"src": "assets/portfolio/formaturas/formaturas-061.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-061-thumb.webp", "alt": "Retrato de formanda com vestido verde", "title": "Retrato de formanda com vestido verde", "caption": "Retrato de formanda com vestido verde."}, {"src": "assets/portfolio/formaturas/formaturas-062.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-062-thumb.webp", "alt": "Formanda levantando o capelo", "title": "Formanda levantando o capelo", "caption": "Formanda levantando o capelo."}, {"src": "assets/portfolio/formaturas/formaturas-063.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-063-thumb.webp", "alt": "Formanda de beca em preto e branco", "title": "Formanda de beca em preto e branco", "caption": "Formanda de beca em preto e branco."}, {"src": "assets/portfolio/formaturas/formaturas-064.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-064-thumb.webp", "alt": "Retrato de formanda com vestido verde", "title": "Retrato de formanda com vestido verde", "caption": "Retrato de formanda com vestido verde."}, {"src": "assets/portfolio/formaturas/formaturas-065.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-065-thumb.webp", "alt": "Formanda em oração durante celebração religiosa", "title": "Formanda em oração durante celebração religiosa", "caption": "Formanda em oração durante celebração religiosa."}, {"src": "assets/portfolio/formaturas/formaturas-066.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-066-thumb.webp", "alt": "Formanda sorrindo na celebração religiosa", "title": "Formanda sorrindo na celebração religiosa", "caption": "Formanda sorrindo na celebração religiosa."}, {"src": "assets/portfolio/formaturas/formaturas-070.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-070-thumb.webp", "alt": "Formanda na celebração religiosa", "title": "Formanda na celebração religiosa", "caption": "Formanda na celebração religiosa."}, {"src": "assets/portfolio/formaturas/formaturas-071.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-071-thumb.webp", "alt": "Formanda apresentando seu canudo", "title": "Formanda apresentando seu canudo", "caption": "Formanda apresentando seu canudo."}, {"src": "assets/portfolio/formaturas/formaturas-073.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-073-thumb.webp", "alt": "Formanda na igreja durante celebração religiosa", "title": "Formanda na igreja durante celebração religiosa", "caption": "Formanda na igreja durante celebração religiosa."}, {"src": "assets/portfolio/formaturas/formaturas-074.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-074-thumb.webp", "alt": "Formanda erguendo o canudo na colação", "title": "Formanda erguendo o canudo na colação", "caption": "Formanda erguendo o canudo na colação."}, {"src": "assets/portfolio/formaturas/formaturas-075.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-075-thumb.webp", "alt": "Formanda aplaudindo durante a colação", "title": "Formanda aplaudindo durante a colação", "caption": "Formanda aplaudindo durante a colação."}, {"src": "assets/portfolio/formaturas/formaturas-076.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-076-thumb.webp", "alt": "Formandas comemorando no baile", "title": "Formandas comemorando no baile", "caption": "Formandas comemorando no baile."}, {"src": "assets/portfolio/formaturas/formaturas-078.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-078-thumb.webp", "alt": "Formanda de vestido verde diante de luzes", "title": "Formanda de vestido verde diante de luzes", "caption": "Formanda de vestido verde diante de luzes."}, {"src": "assets/portfolio/formaturas/formaturas-080.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-080-thumb.webp", "alt": "Detalhe do terço nas mãos de formanda", "title": "Detalhe do terço nas mãos de formanda", "caption": "Detalhe do terço nas mãos de formanda."}, {"src": "assets/portfolio/formaturas/formaturas-081.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-081-thumb.webp", "alt": "Formanda de beca durante a cerimônia", "title": "Formanda de beca durante a cerimônia", "caption": "Formanda de beca durante a cerimônia."}, {"src": "assets/portfolio/formaturas/formaturas-085.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-085-thumb.webp", "alt": "Formandas dançando juntas no palco", "title": "Formandas dançando juntas no palco", "caption": "Formandas dançando juntas no palco."}, {"src": "assets/portfolio/formaturas/formaturas-086.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-086-thumb.webp", "alt": "Formanda emocionada durante a colação", "title": "Formanda emocionada durante a colação", "caption": "Formanda emocionada durante a colação."}, {"src": "assets/portfolio/formaturas/formaturas-087.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-087-thumb.webp", "alt": "Formandas celebrando no palco do baile", "title": "Formandas celebrando no palco do baile", "caption": "Formandas celebrando no palco do baile."}, {"src": "assets/portfolio/formaturas/formaturas-092.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-092-thumb.webp", "alt": "Retrato de formanda com traje preto", "title": "Retrato de formanda com traje preto", "caption": "Retrato de formanda com traje preto."}, {"src": "assets/portfolio/formaturas/formaturas-093.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-093-thumb.webp", "alt": "Formanda sorrindo durante a colação", "title": "Formanda sorrindo durante a colação", "caption": "Formanda sorrindo durante a colação."}, {"src": "assets/portfolio/formaturas/formaturas-094.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-094-thumb.webp", "alt": "Formanda comemorando com uma taça", "title": "Formanda comemorando com uma taça", "caption": "Formanda comemorando com uma taça."}, {"src": "assets/portfolio/formaturas/formaturas-096.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-096-thumb.webp", "alt": "Formanda comemorando em preto e branco", "title": "Formanda comemorando em preto e branco", "caption": "Formanda comemorando em preto e branco."}, {"src": "assets/portfolio/formaturas/formaturas-097.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-097-thumb.webp", "alt": "Convidados e formandas no baile de formatura", "title": "Convidados e formandas no baile de formatura", "caption": "Convidados e formandas no baile de formatura."}, {"src": "assets/portfolio/formaturas/formaturas-098.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-098-thumb.webp", "alt": "Formandas brindando na pista de dança", "title": "Formandas brindando na pista de dança", "caption": "Formandas brindando na pista de dança."}, {"src": "assets/portfolio/formaturas/formaturas-099.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-099-thumb.webp", "alt": "Formanda de vestido verde com taça na festa", "title": "Formanda de vestido verde com taça na festa", "caption": "Formanda de vestido verde com taça na festa."}, {"src": "assets/portfolio/formaturas/formaturas-100.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-100-thumb.webp", "alt": "Abraço durante o baile de formatura", "title": "Abraço durante o baile de formatura", "caption": "Abraço durante o baile de formatura."}, {"src": "assets/portfolio/formaturas/formaturas-102.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-102-thumb.webp", "alt": "Formanda de beca segurando o capelo", "title": "Formanda de beca segurando o capelo", "caption": "Formanda de beca segurando o capelo."}, {"src": "assets/portfolio/formaturas/formaturas-104.webp", "thumbnail": "assets/portfolio/formaturas/formaturas-104-thumb.webp", "alt": "Celebração na pista do baile de formatura", "title": "Celebração na pista do baile de formatura", "caption": "Celebração na pista do baile de formatura."}, {"src": "https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119513/99080_heif_w7wdld.webp", "thumbnail": "https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119513/99080_heif_w7wdld.webp", "alt": "Formanda sorridente na colação", "title": "Abraços e Conquista", "caption": "O sorriso radiante de quem celebra a concretização de uma grande jornada acadêmica."}, {"src": "https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119512/99076_heif_ooufoz.webp", "thumbnail": "https://res.cloudinary.com/lvl0nq3r/image/upload/v1790119512/99076_heif_ooufoz.webp", "alt": "Formanda erguendo o diploma", "title": "O Diploma em Mãos", "caption": "Celebrando a realização de um sonho e o início de um futuro brilhante."}], "eventos": [{"src": "assets/portfolio/eventos/eventos-037.webp", "thumbnail": "assets/portfolio/eventos/eventos-037-thumb.webp", "alt": "Convidados dançando durante um evento", "title": "Convidados dançando durante um evento", "caption": "Convidados dançando durante um evento."}, {"src": "assets/portfolio/eventos/eventos-038.webp", "thumbnail": "assets/portfolio/eventos/eventos-038-thumb.webp", "alt": "Convidados celebrando na pista de dança", "title": "Convidados celebrando na pista de dança", "caption": "Convidados celebrando na pista de dança."}, {"src": "assets/portfolio/eventos/eventos-039.webp", "thumbnail": "assets/portfolio/eventos/eventos-039-thumb.webp", "alt": "Grupo de convidados dançando em uma festa", "title": "Grupo de convidados dançando em uma festa", "caption": "Grupo de convidados dançando em uma festa."}, {"src": "assets/portfolio/eventos/eventos-040.webp", "thumbnail": "assets/portfolio/eventos/eventos-040-thumb.webp", "alt": "Retrato de convidada com vestido vermelho", "title": "Retrato de convidada com vestido vermelho", "caption": "Retrato de convidada com vestido vermelho."}, {"src": "assets/portfolio/eventos/eventos-041.webp", "thumbnail": "assets/portfolio/eventos/eventos-041-thumb.webp", "alt": "Convidados de terno celebrando sob luzes coloridas", "title": "Convidados de terno celebrando sob luzes coloridas", "caption": "Convidados de terno celebrando sob luzes coloridas."}]};

function getCategoryItems(cat) {
  // 1. Prioridade: PORTFOLIO_MANIFEST dinamicamente avaliado no momento do clique
  if (typeof PORTFOLIO_MANIFEST !== 'undefined' && Array.isArray(PORTFOLIO_MANIFEST)) {
    const matched = PORTFOLIO_MANIFEST.filter(i => i.category === cat).map(i => ({
      src: i.url,
      thumbnail: i.thumbnail || i.url,
      width: i.width,
      height: i.height,
      alt: i.alt || i.title || '',
      title: i.title || '',
      caption: i.caption || ''
    }));
    if (matched.length > 0) return matched;
  }
  if (typeof window !== 'undefined' && Array.isArray(window.PORTFOLIO_MANIFEST)) {
    const matched = window.PORTFOLIO_MANIFEST.filter(i => i.category === cat).map(i => ({
      src: i.url,
      thumbnail: i.thumbnail || i.url,
      width: i.width,
      height: i.height,
      alt: i.alt || i.title || '',
      title: i.title || '',
      caption: i.caption || ''
    }));
    if (matched.length > 0) return matched;
  }
  // 2. Fallback integrado garantido (independe de subpastas ou scripts externos)
  if (BUILTIN_PORTFOLIO && BUILTIN_PORTFOLIO[cat] && BUILTIN_PORTFOLIO[cat].length > 0) {
    return BUILTIN_PORTFOLIO[cat];
  }
  // 3. Fallback visual: extrai fotos presentes nos cards da própria seção na página
  const sec = document.getElementById(cat);
  if (sec) {
    const cards = sec.querySelectorAll('.work-card');
    const domItems = [];
    cards.forEach(c => {
      const img = c.querySelector('img');
      const src = c.dataset.image || (img ? img.getAttribute('src') : '');
      const alt = c.dataset.title || (img ? img.getAttribute('alt') : '') || 'Foto';
      if (src) domItems.push({ src, alt, title: c.dataset.title || '', caption: c.dataset.caption || '' });
    });
    if (domItems.length > 0) return domItems;
  }
  return [];
}

const categoryGalleries = {
  formaturas: {
    title: 'Galeria · Formaturas',
    whatsappMessage: 'Olá, Cauan! Vi a galeria de Formaturas no site e gostaria de solicitar um orçamento para o meu evento.'
  },
  eventos: {
    title: 'Galeria · Eventos & Shows',
    whatsappMessage: 'Olá, Cauan! Vi a galeria de Eventos no site e gostaria de solicitar um orçamento para cobertura.'
  },
  aniversarios: {
    title: 'Galeria · Aniversários',
    whatsappMessage: 'Olá, Cauan! Vi a galeria de Aniversários no site e gostaria de solicitar um orçamento.'
  },
  casamentos: {
    title: 'Galeria · Casamentos',
    whatsappMessage: 'Olá, Cauan! Vi a galeria de Casamentos no site e gostaria de conversar sobre a cobertura da minha data.'
  }
};

const catModal = $('#category-gallery-modal');
let catLastFocused = null;

function openCategoryModal(catKey, triggerEl) {
  if (!catModal) return;
  const gallery = categoryGalleries[catKey];
  if (!gallery) return;

  catLastFocused = triggerEl || document.activeElement;

  const titleEl = $('#cat-modal-title');
  const instaBtn = $('#cat-modal-insta-btn') || $('#cat-modal-wa-btn');
  const photosList = $('#cat-modal-photos-list');

  if (titleEl) titleEl.textContent = gallery.title;
  if (instaBtn) instaBtn.href = 'https://www.instagram.com/cauanvideomaker_/';

  // Renderiza fotos no layout de galeria preservando orientação vertical e horizontal
  if (photosList) {
    photosList.innerHTML = '';
    const items = getCategoryItems(catKey);
    if (!items || items.length === 0) {
      photosList.innerHTML = '<div style="column-span: all; text-align: center; padding: 48px 20px; color: #8A92A2;"><p>Carregando fotos da galeria...</p></div>';
    } else {
      items.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'cat-large-photo-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Ampliar imagem: ${item.alt || gallery.title}`);

      const frame = document.createElement('div');
      frame.className = 'cat-large-photo-frame';

      const img = document.createElement('img');
      img.src = item.thumbnail || item.src;
      if (item.width && item.height) { img.width = item.width; img.height = item.height; }
      img.alt = item.alt || gallery.title;
      img.loading = index < 6 ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.referrerPolicy = 'no-referrer';

      img.addEventListener('error', () => {
        card.style.display = 'none';
      });

      // Clique abre no visualizador individual de detalhes
      card.addEventListener('click', () => {
        const detailData = {
          title: item.title || gallery.title,
          category: gallery.title.replace('Galeria · ', ''),
          mediaType: 'photo',
          image: item.src,
          caption: item.caption || item.alt || ''
        };
        openModal(detailData, card);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });

      frame.appendChild(img);
      card.appendChild(frame);
      photosList.appendChild(card);
      });
    }
  }

  catModal.showModal();
  document.body.style.overflow = 'hidden';

  // Reseta scroll do modal para o topo
  const wrapper = catModal.querySelector('.cat-modal-wrapper');
  if (wrapper) wrapper.scrollTop = 0;
}

function closeCategoryModal() {
  if (!catModal || !catModal.open) return;
  catModal.close();
  document.body.style.overflow = '';
  if (catLastFocused && typeof catLastFocused.focus === 'function') {
    catLastFocused.focus();
  }
}

if (catModal) {
  const closeBtn = $('#cat-modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', closeCategoryModal);

  catModal.addEventListener('close', () => {
    document.body.style.overflow = '';
    if (catLastFocused && typeof catLastFocused.focus === 'function') {
      catLastFocused.focus();
    }
  });
  catModal.addEventListener('click', e => {
    if (e.target === catModal) {
      const r = catModal.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) {
        closeCategoryModal();
      }
    }
  });
  catModal.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeCategoryModal();
    }
  });
}

// Attach modal events to work cards
$$('.work-card').forEach(card=>{
  card.style.cursor='pointer';
  card.setAttribute('tabindex','0');
  card.setAttribute('role','button');
  
  if (card.classList.contains('work-card-explore')) {
    card.setAttribute('aria-label', `Abrir galeria completa com mais fotos`);
    
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return;
      openCategoryModal(card.dataset.openGallery, card);
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.closest('a')) return;
        e.preventDefault();
        openCategoryModal(card.dataset.openGallery, card);
      }
    });
    return;
  }

  card.setAttribute('aria-label',`Ver detalhes de ${card.dataset.title||'trabalho'}`);

  card.addEventListener('click',e=>{
    if(e.target.closest('a'))return;
    const d={
      title:card.dataset.title,
      category:card.dataset.category,
      mediaType:card.dataset.mediaType,
      image:card.dataset.image,
      caption:card.dataset.caption,
      videoSrc:card.dataset.videoSrc,
      link:card.dataset.link
    };
    openModal(d,card);
  });

  card.addEventListener('keydown',e=>{
    if(e.key==='Enter'||e.key===' '){
      if(e.target.closest('a'))return;
      e.preventDefault();
      const d={
        title:card.dataset.title,
        category:card.dataset.category,
        mediaType:card.dataset.mediaType,
        image:card.dataset.image,
        caption:card.dataset.caption,
        videoSrc:card.dataset.videoSrc,
        link:card.dataset.link
      };
      openModal(d,card);
    }
  });
});

// Fallback gracioso para falha de carregamento de imagens remotas
$$('.work-card img').forEach(img => {
  img.addEventListener('error', () => {
    const card = img.closest('.work-card');
    if (card) {
      card.style.display = 'none';
      console.warn('Card ocultado com segurança devido a erro na imagem:', img.src);
    }
  });
});

// Category selector and conditional company field logic
const categorySelect=$('#field-category');
const companyWrapper=$('#company-wrapper');
const companyInput=$('#field-company');

function updateCompanyField(category){
  const isCorporate=(category==='Conteúdo para empresa');
  if(companyWrapper){
    companyWrapper.style.display=isCorporate?'block':'none';
  }
  if(companyInput){
    companyInput.required=isCorporate;
    if(!isCorporate){
      companyInput.value='';
    }
  }
}

if(categorySelect){
  categorySelect.addEventListener('change',()=>updateCompanyField(categorySelect.value));
  updateCompanyField(categorySelect.value);
}

// Category buttons: select category and scroll to contact
$$('[data-select-category]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const cat=btn.dataset.selectCategory;
    if(categorySelect){
      categorySelect.value=cat;
      updateCompanyField(cat);
      categorySelect.style.borderColor='#fff';
      setTimeout(()=>{categorySelect.style.borderColor='';},1200);
    }
    const contactSec=$('#contato');
    if(contactSec){
      contactSec.scrollIntoView({behavior:paused?'instant':'smooth'});
      setTimeout(()=>{
        const nameField=$('#field-name');
        if(nameField)nameField.focus();
      },450);
    }
  });
});

// Package selection buttons to auto-select format in the contact form
$$('[data-select-format]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const format=btn.dataset.selectFormat;
    const select=$('#field-production-type');
    if(select){
      select.value=format;
      select.style.borderColor='#fff';
      setTimeout(()=>{select.style.borderColor='';},1200);
    }
    const contactSec=$('#contato');
    if(contactSec){
      contactSec.scrollIntoView({behavior:paused?'instant':'smooth'});
      setTimeout(()=>{
        const nameField=$('#field-name');
        if(nameField)nameField.focus();
      },450);
    }
  });
});

// Contact brief form submission
const briefForm=$('#brief');
if(briefForm){
  briefForm.addEventListener('submit',e=>{
    e.preventDefault();
    const f=new FormData(e.currentTarget);
    const category=String(f.get('category')||'').trim();
    const prodType=String(f.get('production_type')||'').trim();
    const name=String(f.get('name')||'').trim();
    const company=String(f.get('company')||'').trim();
    const city=String(f.get('city')||'').trim();
    const dateRaw=String(f.get('date')||'').trim();
    const desc=String(f.get('project_desc')||'').trim();

    let dateText='';
    if(dateRaw){
      const parts=dateRaw.split('-');
      if(parts.length===3){
        dateText=`, com previsão para ${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    const companyPart=(category==='Conteúdo para empresa'&&company)?` da empresa ${company}`:'';
    const cityPart=city?` em ${city}`:'';
    const formatPart=prodType?` (formato: ${prodType})`:'';

    let text=`Olá, Cauan! Meu nome é ${name}${companyPart}. Gostaria de solicitar um orçamento para ${category}${formatPart}${cityPart}${dateText}.`;
    if(desc){
      text+=` Sobre o projeto: "${desc}".`;
    }
    text+=` Podemos conversar sobre o escopo e a disponibilidade?`;

    $('#result textarea').value=text;
    $('#send').href='https://wa.me/5577988629229?text='+encodeURIComponent(text);
    $('#result').hidden=false;
    $('#result').scrollIntoView({behavior:paused?'instant':'smooth',block:'nearest'});
  });
}

const copyBtn=$('.copy');
if(copyBtn){
  copyBtn.addEventListener('click',async()=>{
    try{
      await navigator.clipboard.writeText($('#result textarea').value);
      $('#copy-status').textContent='Mensagem copiada.';
    }catch{
      $('#result textarea').select();
      $('#copy-status').textContent='Selecione e copie a mensagem acima.';
    }
  });
}

/* ============================================================
   ANIMAÇÃO DA LINHA DE LUZ NAS ETAPAS (MOBILE)
   ============================================================ */
function initStepsAnimation() {
  const stepsContainer = $('#steps-container');
  if (!stepsContainer) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stepsContainer.classList.add('is-active');
        }
      });
    }, { threshold: 0.15 });

    observer.observe(stepsContainer);
  } else {
    stepsContainer.classList.add('is-active');
  }
}
initStepsAnimation();

/* ============================================================
   CARROSSEL COM PONTOS NAVEGÁVEIS (ESTILO INSTAGRAM NO MOBILE)
   ============================================================ */
function initCategoryCarousels() {
  const categoryBlocks = $$('.category-block');
  categoryBlocks.forEach((block) => {
    const grid = block.querySelector('.category-cards-grid');
    const dotsContainer = block.querySelector('.carousel-dots');
    if (!grid || !dotsContainer) return;

    const cards = Array.from(grid.querySelectorAll('.work-card'));
    const dots = Array.from(dotsContainer.querySelectorAll('.carousel-dot'));
    if (cards.length === 0 || dots.length === 0) return;

    // Clique no ponto desliza suavemente até o card
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        if (cards[index]) {
          cards[index].scrollIntoView({
            behavior: paused ? 'instant' : 'smooth',
            block: 'nearest',
            inline: 'center'
          });
          updateActiveDot(dots, index);
        }
      });
    });

    // Atualiza ponto ativo conforme o usuário arrasta no touch
    let scrollTimeout;
    grid.addEventListener('scroll', () => {
      if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
      scrollTimeout = requestAnimationFrame(() => {
        const gridLeft = grid.getBoundingClientRect().left;
        const gridCenter = gridLeft + grid.offsetWidth / 2;

        let closestIndex = 0;
        let minDiff = Infinity;

        cards.forEach((card, i) => {
          const cardRect = card.getBoundingClientRect();
          const cardCenter = cardRect.left + cardRect.width / 2;
          const diff = Math.abs(cardCenter - gridCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = i;
          }
        });

        updateActiveDot(dots, closestIndex);
      });
    }, { passive: true });
  });

  function updateActiveDot(dotsList, activeIndex) {
    dotsList.forEach((d, idx) => {
      const isActive = idx === activeIndex;
      d.classList.toggle('is-active', isActive);
      d.setAttribute('aria-selected', String(isActive));
    });
  }
}
initCategoryCarousels();
