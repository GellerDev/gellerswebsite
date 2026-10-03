// =========================================================
// SITE CONFIG — everything you may need to change lives here
// =========================================================
const CONFIG = {
  // +05:00 is Yekaterinburg time, so the countdown is correct
  // even for guests opening the site from another time zone.
  weddingStart: new Date('2027-06-02T15:00:00+05:00'),
  weddingEnd: new Date('2027-06-02T23:00:00+05:00'),
  eventTitle: 'Свадьба Романа и Виолетты',
  eventLocation: 'Екатеринбург', // TODO: venue address once booked

  // Google Apps Script web app that stores RSVP answers.
  // Setup instructions: google-apps-script/rsvp.gs
  rsvpUrl: 'https://script.google.com/macros/s/AKfycbzLPIXjBYB2dGSinFC3nax5s-Xd7eUdBW3B_ZeBoAKVzPsoj2vC7ty7K8EUThcqtHop/exec',
};

// =========================================================
// 1. COUNTDOWN
// =========================================================
function updateCountdown() {
  const diff = CONFIG.weddingStart - new Date(); // milliseconds left

  if (diff <= 0) {
    document.getElementById('countdown').innerHTML =
      '<p class="hero__date">Этот день настал!</p>';
    clearInterval(timer);
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const seconds = Math.floor(diff / 1000) % 60;

  setCountdownValue('cd-days', days);
  setCountdownValue('cd-hours', hours);
  setCountdownValue('cd-minutes', minutes);
  setCountdownValue('cd-seconds', seconds);
}

// Update a number and replay the "tick" animation only when it changes
function setCountdownValue(id, value) {
  const el = document.getElementById(id);
  if (el.textContent === String(value)) return;
  el.textContent = value;
  el.classList.remove('tick');
  void el.offsetWidth; // force reflow so the animation restarts
  el.classList.add('tick');
}

const timer = setInterval(updateCountdown, 1000);
updateCountdown();

// =========================================================
// 2. REVEAL SECTIONS ON SCROLL
// =========================================================
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // animate only once
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

// =========================================================
// 2a. TOP BAR, READING PROGRESS, BACK-TO-TOP
// =========================================================
const topbar = document.getElementById('topbar');
const burger = document.getElementById('burger');
const progressBar = document.getElementById('progress');
const toTop = document.getElementById('to-top');
const hero = document.getElementById('top');

let scrollTicking = false;
function onScroll() {
  const scrolled = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pastHero = scrolled > hero.offsetHeight * 0.8;

  progressBar.style.setProperty('--progress', max > 0 ? scrolled / max : 0);
  topbar.classList.toggle('topbar--visible', pastHero);
  toTop.classList.toggle('is-visible', pastHero);
  updateTimeline();
  scrollTicking = false;
}

// Schedule: the gold line "draws" itself as you scroll and each
// step lights up once the line reaches it
const timeline = document.getElementById('timeline');
const timelineFill = document.getElementById('timeline-fill');
const timelineItems = timeline.querySelectorAll('.timeline__item');

function updateTimeline() {
  const focusLine = window.innerHeight * 0.6; // "reading point" on screen
  const rect = timeline.getBoundingClientRect();
  const progress = Math.min(Math.max((focusLine - rect.top) / rect.height, 0), 1);
  timelineFill.style.setProperty('--fill', (progress * 100).toFixed(1) + '%');

  timelineItems.forEach((item) => {
    const dot = item.querySelector('.timeline__dot').getBoundingClientRect();
    item.classList.toggle('is-active', dot.top + dot.height / 2 < focusLine);
  });
}

// Batch scroll work into one update per animation frame
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(onScroll);
    scrollTicking = true;
  }
}, { passive: true });
onScroll();

function setMenuOpen(open) {
  topbar.classList.toggle('topbar--open', open);
  burger.setAttribute('aria-expanded', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

burger.addEventListener('click', () => {
  setMenuOpen(!topbar.classList.contains('topbar--open'));
});

// Close the mobile menu after picking a section
document.querySelectorAll('#menu a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

// =========================================================
// 2b. DRESS CODE: "try on" a colour — tints the section background
// =========================================================
const dressSection = document.getElementById('dresscode');
const paletteCaption = document.getElementById('palette-caption');
const swatches = document.querySelectorAll('.palette__item');

swatches.forEach((swatch) => {
  swatch.addEventListener('click', () => {
    const wasSelected = swatch.getAttribute('aria-pressed') === 'true';
    swatches.forEach((s) => s.setAttribute('aria-pressed', 'false'));

    if (wasSelected) {
      dressSection.style.removeProperty('--dress-bg');
      paletteCaption.textContent = 'Нажмите на цвет, чтобы примерить';
      return;
    }

    swatch.setAttribute('aria-pressed', 'true');
    const colour = swatch.style.getPropertyValue('--c');
    dressSection.style.setProperty('--dress-bg', `color-mix(in srgb, ${colour} 35%, #f3ede4)`);
    paletteCaption.textContent = swatch.querySelector('.palette__name').textContent;
  });
});

// =========================================================
// 2c. FLIP CARDS
// =========================================================
document.querySelectorAll('.flip').forEach((card) => {
  const button = card.querySelector('.flip__inner');
  button.addEventListener('click', () => {
    const flipped = card.classList.toggle('is-flipped');
    button.setAttribute('aria-pressed', flipped);
  });
});

// =========================================================
// 3. PERSONAL GREETING
// A link like  https://<site>/?guest=Дорогая бабушка
// replaces the "Дорогие гости!" title with "Дорогая бабушка!"
// =========================================================
const guest = new URLSearchParams(window.location.search).get('guest');
if (guest) {
  // textContent (not innerHTML) so the URL cannot inject markup
  document.getElementById('invite-title').textContent = guest.trim().slice(0, 80) + '!';
}

// =========================================================
// 4. ADD TO CALENDAR
// =========================================================
// Calendar date format: 20270602T100000Z
function toCalendarDate(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

const calendarDates = toCalendarDate(CONFIG.weddingStart) + '/' + toCalendarDate(CONFIG.weddingEnd);

// Google Calendar: a plain link with query parameters
document.getElementById('calendar-google').href =
  'https://calendar.google.com/calendar/render?' +
  new URLSearchParams({
    action: 'TEMPLATE',
    text: CONFIG.eventTitle,
    dates: calendarDates,
    location: CONFIG.eventLocation,
    details: 'Подробности: ' + window.location.origin + window.location.pathname,
  });

// iPhone / Outlook: download an .ics file every calendar app understands
document.getElementById('calendar-ics').addEventListener('click', () => {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding//RU',
    'BEGIN:VEVENT',
    'UID:wedding-20270602@gellers.ru',
    'DTSTAMP:' + toCalendarDate(new Date()),
    'DTSTART:' + toCalendarDate(CONFIG.weddingStart),
    'DTEND:' + toCalendarDate(CONFIG.weddingEnd),
    'SUMMARY:' + CONFIG.eventTitle,
    'LOCATION:' + CONFIG.eventLocation,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  link.download = 'wedding.ics';
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000); // free memory after the download starts
});

// =========================================================
// 5. RSVP FORM
// =========================================================
const form = document.getElementById('rsvp-form');
const attendDetails = document.getElementById('attend-details');
const submitButton = document.getElementById('rsvp-submit');
const errorBox = document.getElementById('rsvp-error');

// Hide guest count and drinks when the guest is not coming
form.querySelectorAll('input[name="attend"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    attendDetails.hidden = radio.value === 'no';
  });
});

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault(); // stay on the page
  errorBox.hidden = true;

  if (!CONFIG.rsvpUrl) {
    console.error('CONFIG.rsvpUrl is not set');
    showError('Анкета временно недоступна. Пожалуйста, свяжитесь с нами по телефону.');
    return;
  }

  const data = new FormData(form);
  const attends = data.get('attend') === 'yes';
  // URL-encoded body = "simple" CORS request, no preflight needed for Apps Script
  const answer = new URLSearchParams({
    name: data.get('name').trim(),
    attend: data.get('attend'),
    guests: attends ? data.get('guests') : '0',
    drinks: attends ? data.getAll('drinks').join(', ') : '',
    comment: data.get('comment').trim(),
  });

  submitButton.disabled = true;
  submitButton.textContent = 'Отправляем…';

  try {
    const response = await fetch(CONFIG.rsvpUrl, { method: 'POST', body: answer });
    const result = await response.json();
    if (result.result !== 'success') throw new Error(result.error);

    form.hidden = true;
    document.getElementById('rsvp-thanks').hidden = false;
  } catch (error) {
    console.error('RSVP submission failed:', error);
    showError('Не получилось отправить ответ. Попробуйте ещё раз или позвоните нам.');
    submitButton.disabled = false;
    submitButton.textContent = 'Отправить';
  }
});
