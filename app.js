/**
 * Kanaka - Interactive Conversational Portfolio App
 * File: app.js
 * 
 * Features:
 * - Native 3D Hologram Particle Sphere on Canvas (no external library, YAGNI-compliant)
 * - Micro-interactions (dynamic button glow follow, smooth typing states)
 * - Adaptive chat sequence routing
 */

// ==========================================================================
// 1. 3D PARTICLE SPHERE RENDERER (Native Math)
// ==========================================================================

const canvas = document.getElementById('canvas3d');
const ctx = canvas.getContext('2d');

let width = canvas.width = canvas.offsetWidth || 342;
let height = canvas.height = canvas.offsetHeight || 160;

const particles = [];
const numParticles = 240;
const sphereRadius = 60;

let autoRotation = 0;
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;
let currentTiltX = 0;
let currentTiltY = 0;

// Handle window resizing
window.addEventListener('resize', () => {
  if (!canvas.offsetParent) return; // Skip if hidden
  width = canvas.width = canvas.offsetWidth || 342;
  height = canvas.height = canvas.offsetHeight || 160;
});

// Generate coordinates distributed evenly on a sphere using Fibonacci Spiral
// ponytail: using standard math algorithms for 3D layout, avoiding massive 3D packages
for (let i = 0; i < numParticles; i++) {
  const phi = Math.acos(-1 + (2 * i) / numParticles);
  const theta = Math.sqrt(numParticles * Math.PI) * phi;
  
  particles.push({
    origX: sphereRadius * Math.cos(theta) * Math.sin(phi),
    origY: sphereRadius * Math.sin(theta) * Math.sin(phi),
    origZ: sphereRadius * Math.cos(phi),
    x: 0,
    y: 0,
    z: 0
  });
}

// Interaction variables for drag-to-rotate interaction
let isDragging = false;
let startX = 0;
let startY = 0;
let rotX = 0;
let rotY = 0;
let velX = 0;
let velY = 0;

// Interaction helpers
function getEventXY(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function handleStart(e) {
  isDragging = true;
  const pos = getEventXY(e);
  startX = pos.x;
  startY = pos.y;
  velX = 0;
  velY = 0;
}

function handleMove(e) {
  if (!isDragging) return;
  
  // Prevent page scroll when interacting on touch screens
  if (e.cancelable) {
    e.preventDefault();
  }
  
  const pos = getEventXY(e);
  const dx = pos.x - startX;
  const dy = pos.y - startY;

  // Horizontal drag rotates around Y axis (left/right)
  // Vertical drag rotates around X axis (up/down)
  const sensitivity = 0.007;
  velY = dx * sensitivity;
  velX = -dy * sensitivity;

  rotY += velY;
  rotX += velX;

  // Clamp vertical rotation so it doesn't spin fully upside down
  const maxTilt = Math.PI / 2.2;
  rotX = Math.max(-maxTilt, Math.min(maxTilt, rotX));

  startX = pos.x;
  startY = pos.y;
}

function handleEnd() {
  isDragging = false;
}

// Attach event listeners
canvas.addEventListener('mousedown', handleStart);
window.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);

canvas.addEventListener('touchstart', handleStart, { passive: false });
window.addEventListener('touchmove', handleMove, { passive: false });
window.addEventListener('touchend', handleEnd);

// Render Loop
function draw3D() {
  // Only animate if the gate is visible
  if (document.getElementById('gate-screen').classList.contains('hide')) {
    requestAnimationFrame(draw3D);
    return;
  }

  ctx.clearRect(0, 0, width, height);

  if (!isDragging) {
    // Apply inertia decay
    rotY += velY;
    rotX += velX;
    velY *= 0.95;
    velX *= 0.95;

    // Standard auto-rotation when user is not actively turning the sphere
    if (Math.abs(velY) < 0.001) {
      rotY += 0.005;
    }
  }

  const cosX = Math.cos(rotX);
  const sinX = Math.sin(rotX);
  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);

  const focalLength = 200;

  // Process and rotate points
  particles.forEach(p => {
    // 1. Rotate around X axis (pitch)
    let y1 = p.origY * cosX - p.origZ * sinX;
    let z1 = p.origZ * cosX + p.origY * sinX;
    let x1 = p.origX;

    // 2. Rotate around Y axis (yaw)
    p.x = x1 * cosY - z1 * sinY;
    p.y = y1;
    p.z = z1 * cosY + x1 * sinY;
  });

  // Sort particles by depth (Z) so that we draw back-to-front (Painters Algorithm)
  particles.sort((a, b) => b.z - a.z);

  particles.forEach(p => {
    // Perspective projection
    const scale = focalLength / (focalLength + p.z);
    const projX = p.x * scale + width / 2;
    const projY = p.y * scale + height / 2;

    // Draw glowing point
    const normalizedZ = (p.z + sphereRadius) / (2 * sphereRadius); // 0 to 1
    const size = 0.8 + normalizedZ * 1.8;
    const opacity = 0.2 + normalizedZ * 0.65;

    ctx.fillStyle = `rgba(217, 164, 65, ${opacity})`;
    ctx.beginPath();
    ctx.arc(projX, projY, size, 0, 2 * Math.PI);
    ctx.fill();
    
    // Subtle glow backing for closer points
    if (normalizedZ > 0.75) {
      ctx.fillStyle = `rgba(217, 164, 65, 0.05)`;
      ctx.beginPath();
      ctx.arc(projX, projY, size * 2.2, 0, 2 * Math.PI);
      ctx.fill();
    }
  });

  requestAnimationFrame(draw3D);
}

// Start 3D rendering
draw3D();


// ==========================================================================
// 2. MICRO-INTERACTION BUTTON GLOW EFFECTS
// ==========================================================================

// Track mouse position on button surfaces to render radial neon highlight
// ponytail: native mouse tracking for fluid layout reactions without heavy listeners
document.querySelectorAll('.opt-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    btn.style.setProperty('--x', `${x}px`);
    btn.style.setProperty('--y', `${y}px`);
  });
});


// ==========================================================================
// 3. CONVERSATIONAL PORTFOLIO ENGINE
// ==========================================================================

const thread = document.getElementById('chat-thread');
const chipsBox = document.getElementById('quick-chips');
const userInput = document.getElementById('userInput');
const gateScreen = document.getElementById('gate-screen');

const MENU = [
  { label: 'what have you built', next: 'projects' },
  { label: 'who are you', next: 'about' },
  { label: 'what are you learning', next: 'learning' },
  { label: 'the dump', next: 'dump' },
  { label: 'blog posts', next: 'blog' },
  { label: "let's talk", next: 'contact', primary: true }
];

const KEYWORD_MAP = [
  { keys: ['project', 'app', 'built', 'build', 'shipped', 'portfolio'], next: 'projects' },
  { keys: ['who are you', 'about you', 'yourself', 'background', 'who r u', 'bio'], next: 'about' },
  { keys: ['learn', 'study', 'course', 'skill'], next: 'learning' },
  { keys: ['dump', 'random', 'scrap', 'unfiltered', 'notes'], next: 'dump' },
  { keys: ['blog', 'post', 'write', 'medium', 'article'], next: 'blog' },
  { keys: ['contact', 'email', 'phone', 'whatsapp', 'reach', 'hire', 'recruit', 'number'], next: 'contact' },
  { keys: ['chess', 'rating', 'lichess'], next: 'about' }
];

const script = {
  hiring: {
    messages: [
      { type: 'text', text: "ah, hiring. good — I'll keep this tight and skip the personality intro." },
      { type: 'text', text: "customer support + chat support, 2+ yrs — Simplilearn, InTouchCX (Walmart process), [24]7.ai (AT&T process). Salesforce CRM." },
      { type: 'text', text: "BCA, Rani Channamma University. based in Bengaluru, targeting 5.5–6+ LPA." },
      { type: 'text', text: "ask me anything below, or jump straight to contact for a resume." }
    ],
    chips: MENU
  },
  curious: {
    messages: [
      { type: 'text', text: "curious — good, that's the fun version of this conversation." },
      { type: 'text', text: "I'm Kanaka. customer support by day, building weird stuff by night. currently mid self-upgrade — this portfolio is part of that." },
      { type: 'text', text: "pick a direction below."}
    ],
    chips: MENU
  },
  stalking: {
    messages: [
      { type: 'text', text: "honestly, respect the honesty." },
      { type: 'text', text: "ok — you get the unfiltered menu, same as everyone else, but I like that you admitted it." },
      { type: 'text', text: "start wherever you want. the dump is probably where you actually end up anyway." }
    ],
    chips: MENU
  },
  projects: {
    messages: [
      { type: 'text', text: "quick tour. some shipped, some half-shipped, one probably abandoned — I'll be honest which." },
      { type: 'link', title: 'TimeLeft', desc: 'shows what % of your day and your life is gone. built a widget too.', domain: 'kanaka.dev/timeleft', gradient: 'linear-gradient(135deg,#d9a441,#7a5416)' },
      { type: 'link', title: 'Digital Gatekeeper', desc: 'makes you state your reason before unlocking your phone, then locks everything else for a bit.', domain: 'kanaka.dev/gatekeeper', gradient: 'linear-gradient(135deg,#4a6fd9,#1f2f6b)' },
      { type: 'link', title: 'Neta Watch', desc: "a database of Indian politicians — criminal records, education — the stuff that should be one search away but isn't.", domain: 'kanaka.dev/netawatch', gradient: 'linear-gradient(135deg,#5bb98c,#1f4a34)' },
      { type: 'link', title: 'CineStream', desc: "rebuilt Netflix's UI. in R. mostly to see if I could.", domain: 'kanaka.dev/cinestream', gradient: 'linear-gradient(135deg,#c95d5d,#5e1f1f)' },
      { type: 'text', text: "there's more — PurgeSnap, OneTask, Rest Interval, GlowUp AI, Desi Games Hub. your call which bucket they land in." }
    ],
    chips: MENU
  },
  about: {
    messages: [
      { type: 'text', text: "background's customer support + chat support. 2+ years — walmart process, at&t process, that whole world." },
      { type: 'text', text: "somewhere along the way got obsessed with prompt engineering, vibe coding, chess, and why Indians think the way we do." },
      { type: 'text', text: "1800 rapid on lichess. was 2000 once. life happened, rating happened." },
      { type: 'text', text: "writing a book right now — 'The Indian Mind.' contrarian on purpose, a little uncomfortable on purpose too." }
    ],
    chips: MENU
  },
  learning: {
    messages: [
      { type: 'text', text: "right now: vibe coding, prompt engineering, marketing, bug bounty hunting." },
      { type: 'text', text: "also actively prepping for an Accenture voice-process interview — the online communication assessment and story-retelling practice specifically." },
      { type: 'text', text: "if it's not on this list, I probably haven't started it yet."}
    ],
    chips: MENU
  },
  dump: {
    messages: [
      { type: 'text', text: "ok, this is the unfiltered folder. not portfolio-ready, but honestly more me than the polished stuff." },
      { type: 'text', text: "scrapped logo concepts for Digital Gatekeeper — pushed away from spy/security vibes, still not settled." },
      { type: 'text', text: "mid-way through a '100 TED talks in 30 days' thing. summaries, not the polished version." },
      { type: 'text', text: 'a sticky note that just says: "subscription audit tool > complaint drafter > bill splitter — build in that order"' }
    ],
    chips: MENU
  },
  blog: {
    messages: [
      { type: 'text', text: "I write on Medium and LinkedIn. mostly build-logs and contrarian takes." },
      { type: 'link', title: '"Nobody wants transparency"', desc: "why Neta Watch exists — and why most people just want outrage with better packaging.", domain: 'medium.com/@kanaka', gradient: 'linear-gradient(135deg,#8a6fd9,#2f1f6b)' },
      { type: 'link', title: 'What 9 apps taught me', desc: 'the honest version — what shipped, what got abandoned, and why.', domain: 'medium.com/@kanaka', gradient: 'linear-gradient(135deg,#d98a4a,#6b3a1f)' }
    ],
    chips: MENU
  },
  contact: {
    messages: [
      { type: 'text', text: "two real ways to reach me:" },
      { type: 'contact', icon: '✉', label: 'Email', value: 'hello@kanaka.dev' },
      { type: 'contact', icon: 'in', label: 'LinkedIn', value: '/in/kanaka' },
      { type: 'text', text: "resume's attached to the email reply — just ask."}
    ],
    chips: MENU
  }
};

// Scroll thread to bottom
function scrollDown() {
  thread.scrollTop = thread.scrollHeight;
}

// Show animated typing indicator
function showTyping() {
  const t = document.createElement('div');
  t.className = 'typing';
  t.id = 'typing-now';
  t.innerHTML = '<span></span><span></span><span></span>';
  thread.appendChild(t);
  scrollDown();
}

// Remove animated typing indicator
function removeTyping() {
  const t = document.getElementById('typing-now');
  if (t) t.remove();
}

// Add standard bot message bubble
function getCurrentTimeStr() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// Add standard bot message bubble
function addBubble(text, isLast) {
  const row = document.createElement('div');
  row.className = 'bubble-row';
  
  const b = document.createElement('div');
  b.className = 'bubble';
  b.textContent = text;
  row.appendChild(b);
  
  const ts = document.createElement('div');
  ts.className = 'timestamp';
  ts.innerHTML = getCurrentTimeStr() + (isLast ? ' <span class="tick">✓✓ seen</span>' : '');
  row.appendChild(ts);
  
  thread.appendChild(row);
  scrollDown();
}

// Add styled link/project card
function addLinkCard(title, desc, domain, gradient) {
  const card = document.createElement('div');
  card.className = 'link-card';
  card.innerHTML = `
    <div class="link-thumb" style="background: ${gradient}">${title}</div>
    <div class="link-body">
      <div class="link-title">${title}</div>
      <div class="link-desc">${desc}</div>
      <div class="link-domain">${domain}</div>
    </div>
  `;
  thread.appendChild(card);
  scrollDown();
}

// Add styled contact card
function addContactCard(icon, label, value) {
  const card = document.createElement('div');
  card.className = 'contact-card';
  card.innerHTML = `
    <div class="icon">${icon}</div>
    <div class="info">
      <b>${label}</b>
      <span>${value}</span>
    </div>
  `;
  thread.appendChild(card);
  scrollDown();
}

// Add system notifications
function addSystemNote(html) {
  const note = document.createElement('div');
  note.className = 'system-note';
  note.innerHTML = note.innerHTML = html;
  thread.appendChild(note);
  scrollDown();
}

// Add user message bubble
function addUserBubble(text) {
  const row = document.createElement('div');
  row.className = 'bubble-row user';
  
  const b = document.createElement('div');
  b.className = 'bubble';
  b.textContent = text;
  row.appendChild(b);
  
  const ts = document.createElement('div');
  ts.className = 'timestamp';
  ts.textContent = getCurrentTimeStr();
  row.appendChild(ts);
  
  thread.appendChild(row);
  scrollDown();
}

// Render dynamic chips
function setChips(options) {
  chipsBox.innerHTML = '';
  options.forEach(opt => {
    const c = document.createElement('div');
    c.className = 'chip' + (opt.primary ? ' primary' : '');
    c.textContent = opt.label;
    c.onclick = () => {
      chipsBox.innerHTML = '';
      playSequence(opt.next);
    };
    chipsBox.appendChild(c);
  });
}

// Dynamic delay simulator (mimics human typing speed relative to character length)
function delayFor(text) {
  return Math.min(1400, 320 + text.length * 14);
}

// Execute sequential text bubble prints
async function playText(text, isLast) {
  showTyping();
  await new Promise(r => setTimeout(r, delayFor(text)));
  removeTyping();
  addBubble(text, isLast);
  await new Promise(r => setTimeout(r, 220));
}

// Execute general script sequence based on active navigation node
async function playSequence(nodeKey) {
  const node = script[nodeKey];
  if (!node) return;

  for (let i = 0; i < node.messages.length; i++) {
    const m = node.messages[i];
    const isLast = i === node.messages.length - 1 && !node.chips;
    
    if (m.type === 'link') {
      showTyping();
      await new Promise(r => setTimeout(r, 600));
      removeTyping();
      addLinkCard(m.title, m.desc, m.domain, m.gradient);
      await new Promise(r => setTimeout(r, 220));
    } else if (m.type === 'contact') {
      showTyping();
      await new Promise(r => setTimeout(r, 450));
      removeTyping();
      addContactCard(m.icon, m.label, m.value);
      await new Promise(r => setTimeout(r, 220));
    } else {
      await playText(m.text, isLast);
    }
  }
  
  if (node.chips) {
    setChips(node.chips);
  }
}

// Entry Point from Gate Screen
function enterChat(intent) {
  gateScreen.classList.add('hide');
  
  // Clear any existing log and print guidelines
  thread.innerHTML = '';
  addSystemNote("👋 <b>How this works</b> — tap a chip or type your own question below. Nothing you send is saved or stored — this resets the moment you refresh or exit.");
  
  playSequence(intent);
}

// Exit chat and return to gate
function exitChat() {
  thread.innerHTML = '';
  chipsBox.innerHTML = '';
  gateScreen.classList.remove('hide');
  // Trigger canvas dimensions refresh
  width = canvas.width = canvas.offsetWidth;
  height = canvas.height = canvas.offsetHeight;
}

// Match user typed input to local directory categories
function matchIntent(text) {
  const lower = text.toLowerCase();
  for (const entry of KEYWORD_MAP) {
    if (entry.keys.some(k => lower.includes(k))) {
      return entry.next;
    }
  }
  return null;
}

// Process user input
async function handleUserMessage() {
  const text = userInput.value.trim();
  if (!text) return;
  
  userInput.value = '';
  chipsBox.innerHTML = '';
  
  addUserBubble(text);
  await new Promise(r => setTimeout(r, 200));

  const matched = matchIntent(text);
  if (matched) {
    await playSequence(matched);
    return;
  }

  // Fallback endpoint logic (simulating AI endpoints)
  showTyping();
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    
    if (!res.ok) throw new Error("Endpoint unreachable");
    
    const data = await res.json();
    removeTyping();
    addBubble(data.reply || "not sure how to answer that — try the contact details below.");
  } catch (err) {
    // Dynamic local fallback if endpoint is not configured/offline
    removeTyping();
    addBubble("I don't have a live AI answer for that here yet (endpoint offline) — but you can ask Kanaka directly:");
    addContactCard('✉', 'Email', 'hello@kanaka.dev');
    addContactCard('in', 'LinkedIn', '/in/kanaka');
  }
  
  setChips(MENU);
}

// Setup Event Listeners
document.getElementById('btn-hiring').onclick = () => enterChat('hiring');
document.getElementById('btn-curious').onclick = () => enterChat('curious');
document.getElementById('btn-stalking').onclick = () => enterChat('stalking');
document.getElementById('btn-exit').onclick = exitChat;
document.getElementById('btn-send').onclick = handleUserMessage;

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleUserMessage();
});

// ==========================================================================
// 4. HOURLY BACKGROUND UPDATER (YAGNI & Native-First)
// ==========================================================================

const BACKGROUND_IMAGES = [
  'assets/1783233609307.png',
  'assets/1783233685851.png',
  'assets/1783233691554.png',
  'assets/1783233696868.png',
  'assets/1783233701839.png',
  'assets/1783233707302.png',
  'assets/1783233712441.png',
  'assets/1783233717814.png',
  'assets/1783233722279.png',
  'assets/1783233726879.png'
];

function updateHourlyBackground() {
  const ambientBg = document.getElementById('ambient-bg');
  if (!ambientBg) return;

  const currentHour = new Date().getHours();
  const imageIndex = currentHour % BACKGROUND_IMAGES.length;
  const selectedImage = BACKGROUND_IMAGES[imageIndex];

  // Preload the image to prevent background flickering during transition
  // ponytail: standard image preloading before changing source, avoiding flash elements
  const img = new Image();
  img.onload = () => {
    ambientBg.style.backgroundImage = `url('${selectedImage}')`;
  };
  img.src = selectedImage;
}

// Initial triggers
updateHourlyBackground();

// ==========================================================================
// 5. HOURLY PROFILE PICTURE UPDATER & POPUP MODAL (YAGNI & Native-First)
// ==========================================================================

const PROFILE_IMAGES = [
  'assets/profile/IMG-20260705-WA0015(1).jpg.jpeg',
  'assets/profile/IMG-20260705-WA0016.jpg.jpeg',
  'assets/profile/IMG-20260705-WA0017.jpg.jpeg',
  'assets/profile/IMG-20260705-WA0018.jpg.jpeg',
  'assets/profile/IMG-20260705-WA0019.jpg.jpeg',
  'assets/profile/IMG-20260705-WA0021.jpg.jpeg',
  'assets/profile/IMG-20260705-WA0023.jpg.jpeg',
  'assets/profile/IMG-20260705-WA0024.jpg.jpeg',
  'assets/profile/IMG-20260705-WA0025.jpg.jpeg',
  'assets/profile/IMG-20260705-WA0026.jpg.jpeg',
  'assets/profile/IMG-20260705-WA0027.jpg.jpeg',
  'assets/profile/IMG-20260705-WA0029.jpg.jpeg'
];

let currentProfileIndex = 0;
let isProfileManuallySet = false;

function updateProfileImage() {
  const avatarImg = document.getElementById('avatar-image');
  const container = document.getElementById('avatar-container');

  if (avatarImg) {
    // Restore image element to container if error fallback cleared it previously
    if (container && !container.contains(avatarImg)) {
      container.textContent = '';
      container.appendChild(avatarImg);
    }
    avatarImg.style.display = 'block';
    avatarImg.src = PROFILE_IMAGES[currentProfileIndex];
  }
}

function updateHourlyProfile() {
  if (isProfileManuallySet) return;
  const currentHour = new Date().getHours();
  currentProfileIndex = currentHour % PROFILE_IMAGES.length;
  updateProfileImage();
}

// Bind avatar click to open the full-screen modal popup
const avatarContainer = document.getElementById('avatar-container');
const profileModal = document.getElementById('profile-modal');
const profileCarousel = document.getElementById('profile-carousel');
const modalPreviewImage = document.getElementById('modal-preview-image');
const carouselPrev = document.getElementById('carousel-prev');
const carouselNext = document.getElementById('carousel-next');
const btnSelectProfile = document.getElementById('btn-select-profile');

let tempProfileIndex = 0;

function initProfileCarousel() {
  if (!profileCarousel) return;
  profileCarousel.innerHTML = '';
  PROFILE_IMAGES.forEach((src, idx) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Option ${idx + 1}`;
    img.className = 'carousel-thumb';
    img.onclick = () => {
      previewProfileImage(idx);
    };
    profileCarousel.appendChild(img);
  });
}

function previewProfileImage(idx) {
  tempProfileIndex = idx;
  if (modalPreviewImage) {
    modalPreviewImage.style.opacity = '0.3';
    setTimeout(() => {
      modalPreviewImage.src = PROFILE_IMAGES[tempProfileIndex];
      modalPreviewImage.style.opacity = '1';
    }, 150);
  }

  // Update active thumbnail classes and center scroll
  if (profileCarousel) {
    const thumbs = profileCarousel.querySelectorAll('.carousel-thumb');
    thumbs.forEach((thumb, tIdx) => {
      if (tIdx === idx) {
        thumb.classList.add('active');
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        thumb.classList.remove('active');
      }
    });
  }
}

if (carouselPrev) {
  carouselPrev.onclick = () => {
    const newIdx = (tempProfileIndex - 1 + PROFILE_IMAGES.length) % PROFILE_IMAGES.length;
    previewProfileImage(newIdx);
  };
}

if (carouselNext) {
  carouselNext.onclick = () => {
    const newIdx = (tempProfileIndex + 1) % PROFILE_IMAGES.length;
    previewProfileImage(newIdx);
  };
}

if (btnSelectProfile) {
  btnSelectProfile.onclick = () => {
    currentProfileIndex = tempProfileIndex;
    isProfileManuallySet = true;
    updateProfileImage();
    closeModal();
  };
}

if (avatarContainer && profileModal) {
  avatarContainer.onclick = () => {
    tempProfileIndex = currentProfileIndex;
    if (modalPreviewImage) {
      modalPreviewImage.src = PROFILE_IMAGES[tempProfileIndex];
    }
    profileModal.classList.add('show');
    profileModal.setAttribute('aria-hidden', 'false');
    
    // Scroll active item into view once layout has settled
    setTimeout(() => {
      previewProfileImage(tempProfileIndex);
    }, 120);
  };
}

// Bind modal close actions
const closeModal = () => {
  if (profileModal) {
    profileModal.classList.remove('show');
    profileModal.setAttribute('aria-hidden', 'true');
  }
};

const closeBtn = document.getElementById('modal-close');
const overlay = document.getElementById('modal-overlay');

if (closeBtn) closeBtn.onclick = closeModal;
if (overlay) overlay.onclick = closeModal;

// Initial trigger
updateHourlyProfile();
initProfileCarousel();

// Periodically check if background and profile images need updating (every 60 seconds)
setInterval(() => {
  updateHourlyBackground();
  updateHourlyProfile();
}, 60000);

// ==========================================================================
// 6. NATIVE BATTERY STATUS UPDATER
// ==========================================================================
function updateBatteryStatus() {
  const pctText = document.getElementById('battery-percentage-text');
  const levelBar = document.getElementById('battery-level-bar');
  const iconContainer = document.getElementById('battery-icon-container');

  function setBattery(level) {
    const percentage = Math.round(level * 100);
    if (pctText) pctText.textContent = percentage + '%';
    if (levelBar) levelBar.style.width = percentage + '%';
    if (iconContainer) iconContainer.setAttribute('aria-label', percentage + '% battery');
  }

  if (navigator.getBattery) {
    navigator.getBattery().then(function(battery) {
      setBattery(battery.level);
      battery.addEventListener('levelchange', function() {
        setBattery(battery.level);
      });
    }).catch(function() {
      setBattery(0.78);
    });
  } else {
    setBattery(0.78);
  }
}

updateBatteryStatus();

// ==========================================================================
// 7. DYNAMIC CLOCK UPDATER
// ==========================================================================
function updateClock() {
  const timeLabel = document.getElementById('time-label');
  if (!timeLabel) return;
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  timeLabel.textContent = `${hours}:${minutes}`;
}

updateClock();
setInterval(updateClock, 10000);
