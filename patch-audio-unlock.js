
// patch-audio-unlock.js
// Ensures the background music can start after any user gesture (mobile Safari/Chrome policy).

(function(){
  function getAudio(){ return document.getElementById('bgAudio'); }

  function tryResumeCtx(){
    try{
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC && window.ctx && typeof window.ctx.resume === 'function'){
        window.ctx.resume().catch(()=>{});
      }
    }catch(e){}
  }

  function tryPlay(){
    const a = getAudio();
    if (!a) return;
    try{ a.muted = false; a.loop = true; a.volume = 1; }catch(e){}
    a.play().then(()=>{
      detach();
    }).catch(()=>{
      // keep listeners for next gesture
    });
  }

  function onGesture(){
    tryResumeCtx();
    tryPlay();
  }

  function detach(){
    ['click','touchstart','pointerdown','keydown'].forEach(ev => {
      document.removeEventListener(ev, onGesture, true);
    });
  }

  function attach(){
    ['click','touchstart','pointerdown','keydown'].forEach(ev => {
      document.addEventListener(ev, onGesture, true);
    });
  }

  function hookButtons(){
    ['openStory','toSlide3','toSlide4','toSlide5'].forEach(id => {
      const el = document.getElementById(id);
      if (el){
        el.addEventListener('click', function(){
          setTimeout(()=>{ onGesture(); }, 10);
        });
      }
    });
  }

  function init(){
    attach();
    hookButtons();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
