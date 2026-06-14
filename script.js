/* ====== Helpers ====== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);

// Check for reduced motion preference (accessibility)
const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ====== Preloader ====== */
// Runs first and independently so a later error (e.g. in GSAP setup)
// can never prevent the preloader from completing and hiding.
window.addEventListener('DOMContentLoaded', () => {
  const progressBar = document.getElementById('progress-bar');
  const preloader = document.getElementById('preloader');
  if (!progressBar || !preloader) return;

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
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 500);
    }, 400);
  });
});

/* ====== GSAP Setup ====== */
if (!prefersReduced && typeof gsap !== 'undefined') {
try {
  gsap.registerPlugin(ScrollTrigger);
  
  // Performance optimizations for ScrollTrigger
  ScrollTrigger.defaults({
    markers: false,
  });
  
  // Reduce motion for mobile devices
  const isMobile = window.innerWidth < 768;
  
  /* ====== Hero Section Scroll Animations ====== */
  gsap.timeline({
    scrollTrigger: {
      trigger: '#hero',
      start: 'top center',
      end: 'center center',
      scrub: false,
      once: true
    }
  })
  .from('.hero-h1', {
    duration: 1.2,
    opacity: 0,
    y: 30,
    ease: 'power2.out'
  }, 0)
  .from('.hero-p', {
    duration: 1.2,
    opacity: 0,
    y: 30,
    ease: 'power2.out'
  }, 0.2)
  .from('.hero-id', {
    duration: 1.2,
    opacity: 0,
    scale: 0.95,
    ease: 'power2.out'
  }, 0);

  /* ====== Project Cards Staggered Scroll Animation ====== */
  gsap.to('.prjt1, .prjt2, .prjt3, .prjt4', {
    scrollTrigger: {
      trigger: '#work',
      start: 'top 60%',
      end: 'top 30%',
      scrub: false,
      once: true
    },
    duration: 1.2,
    opacity: 1,
    y: 0,
    stagger: 0.15,
    ease: 'power2.out',
    clearProps: 'all'
  });
  
  // Initial state for project cards
  gsap.set('.prjt1, .prjt2, .prjt3, .prjt4', {
    opacity: 0,
    y: isMobile ? 20 : 40
  });

  /* ====== Section Heading Animation ====== */
  gsap.from('.section-heading', {
    scrollTrigger: {
      trigger: '#work',
      start: 'top 70%',
      once: true
    },
    duration: 1.2,
    opacity: 0,
    x: -40,
    ease: 'power2.out'
  });

  /* ====== Contact Section Animation ====== */
  gsap.from('.contact-heading', {
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 70%',
      once: true
    },
    duration: 1.2,
    opacity: 0,
    y: 30,
    ease: 'power2.out'
  });

  /* ====== Contact Form Stagger Animation ====== */
  gsap.from('#contact input, #contact textarea, #send-btn', {
    scrollTrigger: {
      trigger: '.form-container',
      start: 'top 70%',
      once: true
    },
    duration: 0.6,
    opacity: 0,
    y: 20,
    stagger: 0.1,
    ease: 'power2.out'
  });

  /* ====== Footer Fade In ====== */
  gsap.from('#footer-info', {
    scrollTrigger: {
      trigger: 'footer',
      start: 'top 80%',
      once: true
    },
    duration: 1.2,
    opacity: 0,
    y: 20,
    ease: 'power2.out'
  });

  /* ====== SVG Signature Draw Animation ====== */
  const signaturePath = $('.signature-path path');
  if (signaturePath) {
    gsap.set(signaturePath, {
      strokeDasharray: 'none',
      stroke: 'currentColor',
      fill: 'none',
      strokeWidth: '1'
    });
    
    const pathLength = signaturePath.getTotalLength();
    gsap.set(signaturePath, {
      strokeDasharray: pathLength,
      strokeDashoffset: pathLength
    });
    
    gsap.to(signaturePath, {
      scrollTrigger: {
        trigger: '.img-container',
        start: 'top 60%',
        end: 'top 40%',
        scrub: 1,
        once: true
      },
      strokeDashoffset: 0,
      duration: 1.5,
      ease: 'none'
    });
  }

  // Refresh ScrollTrigger after images load for accurate positioning
  window.addEventListener('load', () => {
    ScrollTrigger.refresh();
  });
} catch (err) {
  console.error('GSAP animation setup failed:', err);
}
}

/* ====== Contact starfield canvas (sized to contact section) ====== */
(function starfield() {
  const canvas = $('#starfield');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w = 0, h = 0;
  let stars = [];
  const speed = 0.9;
  const streaks = true;
  const warp = false;

  function getStarCount() {
    return window.innerWidth < 768 ? 600 : 1600;
  }

  function initStars() {
    const numStars = getStarCount();
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
                btn.textContent = 'Sent!';
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