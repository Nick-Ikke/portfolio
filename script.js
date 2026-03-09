/* ====== Helpers ====== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ====== Hero role switch animation ====== */
(function heroRoles() {
  const roles = $$('.role');
  let idx = 0;

  function tick() {
    roles.forEach((r, i) => r.classList.toggle('active', i === idx));
    idx = (idx + 1) % roles.length;
  }

  // prefer-reduced-motion respects user's settings
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced) {
    tick();
    setInterval(tick, 2000);
  } else {
    roles.forEach((r,i) => r.classList.toggle('active', i === 0));
  }
})();

/* ====== Contact starfield canvas (sized to contact section) ====== */
(function starfield() {
  const canvas = $('#starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = 0, h = 0;
  let stars = [];
  const numStars = 1600; 
  const speed = 0.9;
  const streaks = true;
  const warp = false;

  function initStars() {
    stars = Array.from({ length: numStars }, () => ({
      x: (Math.random() - 0.5) * w * 2,
      y: (Math.random() - 0.5) * h * 2,
      z: Math.random() * Math.max(w, h)
    }));
  }

  function resize() {
    
    const section = canvas.parentElement;
    if (!section) return;
    w = canvas.width = Math.max(1, Math.floor(section.clientWidth));
    h = canvas.height = Math.max(1, Math.floor(section.clientHeight));
    ctx.setTransform(1,0,0,1,0,0); 
    initStars();
  }

  let rafId;
  function draw() {
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(0,0,w,h);

    const cx = w / 2;
    const cy = h / 2;

    for (let s of stars) {
      s.z -= speed;
      if (s.z <= 0) {
        s.z = Math.max(w,h);
        s.x = (Math.random() - 0.5) * w * 2;
        s.y = (Math.random() - 0.5) * h * 2;
      }
      const sx = cx + (s.x / s.z) * w;
      const sy = cy + (s.y / s.z) * w;
      const pz = s.z + speed;
      const px = cx + (s.x / pz) * w;
      const py = cy + (s.y / pz) * w;

      const size = Math.max(0.3, (1 - s.z / Math.max(w,h)) * 2.2);
      ctx.strokeStyle = '#fff8e7';
      ctx.lineWidth = size;

      if (streaks) {
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
      }
    }

    if (warp) {
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, w / 2);
      gradient.addColorStop(0, 'rgba(255,255,255,0.12)');
      gradient.addColorStop(1, '#1c1a16');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }

    rafId = requestAnimationFrame(draw);
  }

  // Resize observer for container changes (responsive)
  const ro = new ResizeObserver(() => {
    cancelAnimationFrame(rafId);
    resize();
    rafId = requestAnimationFrame(draw);
  });

  ro.observe(canvas.parentElement);
  resize();
  draw();

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(rafId);
    ro.disconnect();
  });
})();

const contactForm = document.getElementById('contact-form');
const btn = document.getElementById('send-btn');

// Only run if the form actually exists on the page
if (contactForm && btn) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();



        btn.disabled = true;
        btn.textContent = 'Sending...';

        const formData = new FormData(contactForm);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
        .then(async (response) => {
            if (response.status == 200) {
                btn.textContent = 'Sent ✓';
                contactForm.reset();
            } else {
                btn.textContent = 'Error!';
            }
        })
        .catch(error => {
            console.error(error);
            btn.textContent = 'Error!';
        })
        .finally(() => {
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = 'Send Message';
            }, 3000);
        });
    });
}

(function focusStyle() {
  function handleFirstTab(e) {
    if (e.key === 'Tab') {
      document.documentElement.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  window.addEventListener('keydown', handleFirstTab);
})();

window.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById('progress-bar');
  
  // 1. Immediate jump to show progress has started
  progressBar.style.width = '30%';

  // 2. Slow "fake" crawl to 80% to keep the user engaged
  // This simulates background activity
  const slowFill = setInterval(() => {
    // Get current width (strip the '%')
    let currentWidth = parseFloat(progressBar.style.width);
    
    if (currentWidth < 80) {
      progressBar.style.width = (currentWidth + 2) + '%';
    } else {
      clearInterval(slowFill);
    }
  }, 400); // Adjust speed here

  // 3. The Final Reveal
  window.addEventListener('load', () => {
    clearInterval(slowFill); // Stop the fake crawl
    progressBar.style.width = '100%'; // Snap to finish

    setTimeout(() => {
      const preloader = document.getElementById('preloader');
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }, 400);
  });
});