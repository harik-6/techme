// =============================================
// THEME TOGGLE
// =============================================
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// =============================================
// NAVBAR SCROLL EFFECT
// =============================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  if (scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Highlight active nav link
  const sections = document.querySelectorAll('section[id]');
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    const bottom = top + section.offsetHeight;
    const link = document.querySelector(`.nav-link[href="#${section.id}"]`);
    if (link) {
      if (scrollY >= top && scrollY < bottom) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });

  lastScroll = scrollY;
}, { passive: true });

// =============================================
// MOBILE MENU
// =============================================
const mobileMenuBtn = document.getElementById('mobileMenu');
const mobileNav = document.getElementById('mobileNav');

mobileMenuBtn.addEventListener('click', () => {
  mobileMenuBtn.classList.toggle('active');
  mobileNav.classList.toggle('open');
});

document.querySelectorAll('.mobile-nav-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenuBtn.classList.remove('active');
    mobileNav.classList.remove('open');
  });
});


// =============================================
// SCROLL REVEAL
// =============================================
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);

        // Animate skill bars
        const fills = entry.target.querySelectorAll('.skill-fill');
        fills.forEach(fill => {
          const w = fill.getAttribute('data-width');
          setTimeout(() => { fill.style.width = w + '%'; }, 200);
        });

        // Animate counters
        const counters = entry.target.querySelectorAll('.stat-number');
        counters.forEach(counter => {
          animateCounter(counter);
        });
      }
    });
  },
  { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Also observe skill categories for bar animations
const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const fills = entry.target.querySelectorAll('.skill-fill');
        fills.forEach(fill => {
          const w = fill.getAttribute('data-width');
          setTimeout(() => { fill.style.width = w + '%'; }, 200);
        });
        skillObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll('.skill-category').forEach(el => skillObserver.observe(el));

// =============================================
// COUNTER ANIMATION
// =============================================
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 1500;
  const start = performance.now();

  function update(time) {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// =============================================
// PARTICLES BACKGROUND
// =============================================
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');

let particles = [];
let mouse = { x: null, y: null };

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resize();
window.addEventListener('resize', resize);

window.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.r = Math.random() * 1.5 + 0.5;
    this.alpha = Math.random() * 0.5 + 0.1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

    // Mouse repulsion
    if (mouse.x !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        const force = (100 - dist) / 100;
        this.x -= dx * force * 0.03;
        this.y -= dy * force * 0.03;
      }
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(99, 102, 241, ${this.alpha})`;
    ctx.fill();
  }
}

// Init particles
for (let i = 0; i < 80; i++) {
  particles.push(new Particle());
}

function drawConnections() {
  const maxDist = 120;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.15;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}

animateParticles();


// =============================================
// SMOOTH HOVER TILT ON CARDS
// =============================================
document.querySelectorAll('.mini-project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * 5;
    const ry = ((cx - x) / cx) * 5;
    card.style.transform = `translateY(-4px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    card.style.transformStyle = 'preserve-3d';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// =============================================
// PAGE LOAD ENTRANCE
// =============================================
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  // Trigger hero reveals immediately
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 150);
    });
  }, 100);
});
