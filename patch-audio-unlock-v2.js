// patch-audio-unlock-v2.js
// Works without relying on site variables or an existing AudioContext.
// On first user gesture, resumes a fresh AudioContext (Safari/iOS requirement),
// plays a tiny silent sound to "unlock", then attempts to play #bgAudio.

(function(){
  let unlocked = false;

  function getAudio(){ return document.getElementById('bgAudio'); }

  function resumeWebAudio(){
    try{
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ac = new AC();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      gain.gain.value = 0.00001; // silent
      osc.connect(gain).connect(ac.destination);
      osc.start(0);
      // stop quickly
      setTimeout(()=>{
        try{ osc.stop(); }catch(e){}
      }, 20);
      ac.resume && ac.resume().catch(()=>{});
    }catch(e){}
  }

  function tryPlayBG(){
    const a = getAudio();
    if (!a) return Promise.resolve();
    try {
      a.muted = false;
      a.loop = true;
      if (a.paused) {
        return a.play().catch(()=>{});
      }
    } catch(e){}
    return Promise.resolve();
  }

  function onGesture(){
    if (unlocked) return;
    unlocked = true;
    resumeWebAudio();
    tryPlayBG().finally(detach);
  }

  function attach(){
    ['click','touchstart','pointerdown','keydown'].forEach(ev => {
      document.addEventListener(ev, onGesture, {capture:true, passive:true});
    });
  }

  function detach(){
    ['click','touchstart','pointerdown','keydown'].forEach(ev => {
      document.removeEventListener(ev, onGesture, {capture:true});
    });
  }

  function hookButtons(){
    ['openStory','toSlide3','toSlide4','toSlide5'].forEach(id => {
      const el = document.getElementById(id);
      if (el){
        el.addEventListener('click', function(){
          // In case button click happens before our document listeners
          onGesture();
        }, {once:false});
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
