document.getElementById('year').textContent = new Date().getFullYear();
document.querySelector('footer').innerHTML = document.querySelector('footer').innerHTML.replace('{buildNumber}', Math.floor(Math.random()*900+100));

/* ---------- Typed role text ---------- */
const roles = ["devops.engineer", "cloud & container specialist", "ci/cd automation builder", "kubernetes wrangler"];
const typedEl = document.getElementById('typedRole');
let rIdx = 0, cIdx = 0, deleting = false;
function typeLoop(){
  const current = roles[rIdx];
  if(!deleting){
    cIdx++;
    typedEl.textContent = current.slice(0, cIdx);
    if(cIdx === current.length){ deleting = true; setTimeout(typeLoop, 1400); return; }
  } else {
    cIdx--;
    typedEl.textContent = current.slice(0, cIdx);
    if(cIdx === 0){ deleting = false; rIdx = (rIdx+1) % roles.length; }
  }
  setTimeout(typeLoop, deleting ? 35 : 65);
}
typeLoop();

/* ---------- Terminal status line cycling ---------- */
const termLines = ["$ status --check", "> containers: 12 running", "> build: passing ✓", "> deploy: production ✓"];
let tIdx = 0;
setInterval(() => {
  tIdx = (tIdx + 1) % termLines.length;
  const el = document.getElementById('terminalLine');
  el.style.opacity = 0;
  setTimeout(() => { el.textContent = termLines[tIdx]; el.style.opacity = 1; }, 250);
}, 2600);
document.getElementById('terminalLine').style.transition = 'opacity .25s ease';

/* ---------- Scroll-triggered reveals ---------- */
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => io.observe(el));

/* ---------- Pipeline progress ---------- */
const fill = document.getElementById('pipelineFill');
const cursor = document.getElementById('pipelineCursor');
function updatePipeline(){
  const doc = document.documentElement;
  const scrollTop = window.scrollY;
  const max = doc.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0;
  fill.style.height = pct + '%';
  cursor.style.top = pct + '%';
}
window.addEventListener('scroll', () => requestAnimationFrame(updatePipeline), { passive:true });
updatePipeline();

/* ---------- Nav active state + sliding pill ---------- */
const navLinks = document.querySelectorAll('.nav-link');
const navPill = document.getElementById('navPill');
const sections = Array.from(navLinks).map(a => document.getElementById(a.dataset.target));

function moveNavPill(link){
  if(!link) return;
  navPill.style.left = link.offsetLeft + 'px';
  navPill.style.width = link.offsetWidth + 'px';
}

function setActiveByScroll(){
  let currentId = sections[0].id;
  const y = window.scrollY + window.innerHeight * 0.35;
  sections.forEach(sec => { if(sec.offsetTop <= y) currentId = sec.id; });
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.target === currentId));
  const activeLink = document.querySelector('.nav-link.active');
  moveNavPill(activeLink);
}
window.addEventListener('scroll', () => requestAnimationFrame(setActiveByScroll), { passive:true });
window.addEventListener('resize', setActiveByScroll);
window.addEventListener('load', setActiveByScroll);
setTimeout(setActiveByScroll, 200);

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById(link.dataset.target).scrollIntoView({ behavior:'smooth' });
  });
});

/* ---------- Project details modal ---------- */
const projectsData = {
  parking: {
    kicker: 'parking-system.py',
    title: 'AI Parking Management System',
    desc: 'A camera-based vehicle detection system built to automate parking slot monitoring. Instead of manual checks, cameras continuously scan the lot and report which spaces are open in real time.',
    bullets: [
      'Detects vehicles and classifies slot status (occupied / available) from live camera feed.',
      'Built as part of a Computer Science specialization in AI DevOps at University of the Punjab.',
      'Applies core computer vision techniques for object detection and spatial mapping.'
    ],
    tech: ['Python', 'OpenCV', 'Computer Vision']
  },
  mcq: {
    kicker: 'mcq-generator.py',
    title: 'AI MCQs Generator',
    desc: 'A Flask web application that uses AI to turn source content into ready-to-use multiple-choice questions, cutting down the manual work involved in writing quizzes and assessments.',
    bullets: [
      'Flask backend serving an AI-driven question generation pipeline.',
      'Takes input content and produces structured multiple-choice questions with answer options.',
      'Built with clean, reusable Python code for real-world usability.'
    ],
    tech: ['Python', 'Flask', 'AI']
  },
  voting: {
    kicker: 'voting-system.py',
    title: 'Voting System',
    desc: 'A Flask-based web application for running elections online — covering candidate setup, ballot casting, and result tracking in one streamlined workflow.',
    bullets: [
      'REST API-driven Flask app handling candidates, ballots, and vote tallying.',
      'Designed around a simple, reliable workflow from vote cast to result.',
      'Built with an emphasis on clean backend structure and data integrity.'
    ],
    tech: ['Python', 'Flask', 'REST API']
  }
};

const modalOverlay = document.getElementById('modalOverlay');
const modalKicker = document.getElementById('modalKicker');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalList = document.getElementById('modalList');
const modalChips = document.getElementById('modalChips');

function openProjectModal(id){
  const data = projectsData[id];
  if(!data) return;
  modalKicker.textContent = data.kicker;
  modalTitle.textContent = data.title;
  modalDesc.textContent = data.desc;
  modalList.innerHTML = data.bullets.map(b => `<li>${b}</li>`).join('');
  modalChips.innerHTML = data.tech.map(t => `<span class="chip">${t}</span>`).join('');
  modalOverlay.classList.add('open');
  document.body.classList.add('modal-lock');
}
function closeProjectModal(){
  modalOverlay.classList.remove('open');
  document.body.classList.remove('modal-lock');
}
document.querySelectorAll('.project-cta[data-project]').forEach(btn => {
  btn.addEventListener('click', () => openProjectModal(btn.dataset.project));
});
document.getElementById('modalClose').addEventListener('click', closeProjectModal);
modalOverlay.addEventListener('click', (e) => { if(e.target === modalOverlay) closeProjectModal(); });
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeProjectModal(); });

/* ---------- 3D tilt on project cards ---------- */
document.querySelectorAll('[data-tilt]').forEach(card => {
  let rect;
  function onMove(e){
    rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (py - 0.5) * -10;
    const ry = (px - 0.5) * 10;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
  }
  function onLeave(){
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)';
  }
  card.addEventListener('mousemove', onMove);
  card.addEventListener('mouseleave', onLeave);
});

/* ---------- Subtle parallax on hero photo ---------- */
const photoStage = document.querySelector('.photo-stage');
window.addEventListener('mousemove', (e) => {
  if(window.innerWidth < 860 || !photoStage) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 16;
  const y = (e.clientY / window.innerHeight - 0.5) * 16;
  photoStage.style.transform = `translate(${x}px, ${y}px)`;
});
