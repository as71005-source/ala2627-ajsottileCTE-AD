const dateText = document.getElementById('dateText');
const footerDate = document.getElementById('footerDate');
const themeToggle = document.getElementById('themeToggle');

const moodDate = document.getElementById('moodDate');
const moodSummary = document.getElementById('moodSummary');
const toolStatus = document.getElementById('toolStatus');
const moodNote = document.getElementById('moodNote');
const saveMoodButton = document.getElementById('saveMoodButton');
const moodButtons = document.querySelectorAll('.mood-button');

let selectedMood = '';

const today = new Date();
const options = { month: 'long', year: 'numeric' };
const formatted = new Intl.DateTimeFormat('en-US', options).format(today);

if (dateText) {
  dateText.textContent = formatted;
}

if (footerDate) {
  footerDate.textContent = formatted;
}

if (moodDate) {
  moodDate.textContent = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

moodButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedMood = button.dataset.mood;

    moodButtons.forEach((item) => {
      item.classList.toggle('selected', item === button);
    });

    if (toolStatus) {
      toolStatus.textContent = `Selected mood: ${button.textContent.trim()}`;
    }
  });
});

const updateMoodSummary = (savedEntry) => {
  if (!moodSummary) {
    return;
  }

  if (!savedEntry) {
    moodSummary.textContent = 'Today: not logged yet';
    return;
  }

  const readableMood = {
    happy: 'Happy',
    calm: 'Calm',
    stressed: 'Stressed',
    tired: 'Tired'
  }[savedEntry.mood] || savedEntry.mood;

  moodSummary.textContent = `Today: ${readableMood}`;
};

if (saveMoodButton) {
  saveMoodButton.addEventListener('click', () => {
    if (!selectedMood) {
      if (toolStatus) {
        toolStatus.textContent = 'Choose a mood before saving.';
      }
      return;
    }

    const entry = {
      date: new Date().toISOString().slice(0, 10),
      mood: selectedMood,
      note: moodNote ? moodNote.value.trim() : ''
    };

    const entries = JSON.parse(localStorage.getItem('portal-mood-entries') || '[]');
    const existingIndex = entries.findIndex((item) => item.date === entry.date);

    if (existingIndex >= 0) {
      entries[existingIndex] = entry;
    } else {
      entries.push(entry);
    }

    localStorage.setItem('portal-mood-entries', JSON.stringify(entries));
    updateMoodSummary(entry);

    if (toolStatus) {
      toolStatus.textContent = `Mood saved for ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`;
    }
  });
}

const savedEntries = JSON.parse(localStorage.getItem('portal-mood-entries') || '[]');
const todayEntry = savedEntries.find((entry) => entry.date === new Date().toISOString().slice(0, 10));
updateMoodSummary(todayEntry);

const applyTheme = (isDark) => {
  document.body.classList.toggle('dark-mode', isDark);

  if (themeToggle) {
    const icon = themeToggle.querySelector('.theme-toggle__icon');
    const label = themeToggle.querySelector('.theme-toggle__label');

    if (icon) {
      icon.textContent = isDark ? '🌙' : '☀️';
    }

    if (label) {
      label.textContent = isDark ? 'Dark' : 'Light';
    }

    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  localStorage.setItem('themePreference', isDark ? 'dark' : 'light');
};

const savedTheme = localStorage.getItem('themePreference');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
  applyTheme(true);
} else {
  applyTheme(false);
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark-mode');
    applyTheme(isDark);
  });
}

const tiltCards = document.querySelectorAll('.tilt-card');

tiltCards.forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 10;
    const rotateX = (0.5 - (y / rect.height)) * 10;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});
