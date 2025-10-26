// patch-back.js (v5 - simple & robust)
// Strategy: keep our own `currentSlide` flag updated ONLY by click events.
// Show Back on slides 2..5; hide on slide 1. Navigation strictly 5→4→3→2→1.

(function(){
  let currentSlide = 1;

  // Elements
  const s1 = () => document.getElementById('story-cta');     // slide 1 area (CTA)
  const s2 = () => document.getElementById('story-slide');    // slide 2
  const s3 = () => document.getElementById('story-slide-3');  // slide 3
  const s4 = () => document.getElementById('story-slide-4');  // slide 4
  const s5 = () => document.getElementById('story-slide-5');  // slide 5

  function ensureBackBtn(){
    let el = document.querySelector('.back-cta');
    if (!el){
      el = document.createElement('button');
      el.className = 'back-cta';
      el.type = 'button';
      el.textContent = 'Quay lại';
      document.body.appendChild(el);
    }
    return el;
  }

  // Helpers to show/hide slides the way the site expects
  function show(el){ if(el){ el.classList.add('active'); el.classList.remove('force-hide'); el.removeAttribute('aria-hidden'); } }
  function hide(el){ if(el){ el.classList.remove('active'); el.setAttribute('aria-hidden','true'); } }

  function updateBackVisibility(){
    const btn = ensureBackBtn();
    btn.classList.toggle('is-visible', currentSlide >= 2);
  }

  function goBack(){
    const btn = ensureBackBtn();
    // Strict stack: 5->4->3->2->1
    if (currentSlide === 5){
      hide(s5()); show(s4()); currentSlide = 4; updateBackVisibility(); return;
    }
    if (currentSlide === 4){
      hide(s4()); show(s3()); currentSlide = 3; updateBackVisibility(); return;
    }
    if (currentSlide === 3){
      hide(s3()); show(s2()); currentSlide = 2; updateBackVisibility(); return;
    }
    if (currentSlide === 2){
      // Back to slide 1: just hide slide 2 and scroll to top; keep slide1/CTA visible
      hide(s2());
      try{ s1() && s1().scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){}
      currentSlide = 1;
      updateBackVisibility();
      return;
    }
    // Slide 1: do nothing (button hidden anyway)
  }

  function hookForward(){
    const btn = ensureBackBtn();
    btn.addEventListener('click', goBack);

    // Hard-wire our flag on click of forward CTAs
    const m = new Map([
      ['openStory', 2],
      ['toSlide3', 3],
      ['toSlide4', 4],
      ['toSlide5', 5],
    ]);
    m.forEach((slideNo, id) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', () => {
          // Allow the site's own handlers to run, then set our state + show back
          setTimeout(() => { currentSlide = slideNo; updateBackVisibility(); }, 60);
        });
      }
    });

    // Delegation fallback (in case buttons re-render)
    document.addEventListener('click', (e)=>{
      const t = e.target;
      if (!t) return;
      const id = t.id || (t.closest && t.closest('#openStory,#toSlide3,#toSlide4,#toSlide5') && t.closest('#openStory,#toSlide3,#toSlide4,#toSlide5').id);
      if (!id) return;
      const mapVal = m.get(id);
      if (mapVal){
        setTimeout(()=> { currentSlide = mapVal; updateBackVisibility(); }, 60);
      }
    });
  }

  function init(){
    // Start at slide 1
    currentSlide = 1;
    ensureBackBtn();
    hookForward();
    updateBackVisibility();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
