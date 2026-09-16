const dateText = document.getElementById('dateText');
const footerDate = document.getElementById('footerDate');

const today = new Date();
const options = { month: 'long', year: 'numeric' };
const formatted = new Intl.DateTimeFormat('en-US', options).format(today);

if (dateText) {
  dateText.textContent = formatted;
}

if (footerDate) {
  footerDate.textContent = formatted;
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
