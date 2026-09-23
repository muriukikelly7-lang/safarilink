const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}

const carousel = document.querySelector('[data-carousel]');

if (carousel) {
  const slides = carousel.querySelectorAll('.carousel-slide');
  const dots = carousel.querySelectorAll('.carousel-dot');
  const previousButton = carousel.querySelector('.previous');
  const nextButton = carousel.querySelector('.next');
  let currentSlide = 0;
  let timer;

  const showSlide = (slideIndex) => {
    currentSlide = (slideIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle('active', index === currentSlide));
    dots.forEach((dot, index) => dot.classList.toggle('active', index === currentSlide));
  };

  const restartTimer = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(currentSlide + 1), 6000);
  };

  dots.forEach((dot, index) => dot.addEventListener('click', () => {
    showSlide(index);
    restartTimer();
  }));
  previousButton.addEventListener('click', () => {
    showSlide(currentSlide - 1);
    restartTimer();
  });
  nextButton.addEventListener('click', () => {
    showSlide(currentSlide + 1);
    restartTimer();
  });
  restartTimer();
}

const tabs = document.querySelectorAll('.tab');
const tripRadios = document.querySelectorAll('input[name="trip"]');
const returnDateInput = document.querySelectorAll('.field input[type="date"]')[1];
const form = document.querySelector('.booking-form');
const submitButton = document.querySelector('.primary-btn.wide');

if (tabs.length) {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

if (tripRadios.length && returnDateInput) {
  const updateTripMode = () => {
    const oneWay = Array.from(tripRadios).some((radio) => radio.checked && radio.nextSibling && radio.nextSibling.textContent.trim() === 'One-way');
    returnDateInput.disabled = oneWay;
    returnDateInput.style.opacity = oneWay ? '0.5' : '1';
    returnDateInput.parentElement.style.opacity = oneWay ? '0.55' : '1';
  };

  tripRadios.forEach((radio) => {
    radio.addEventListener('change', updateTripMode);
  });

  updateTripMode();
}

if (form && submitButton) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Searching...';
    submitButton.disabled = true;

    setTimeout(() => {
      submitButton.textContent = 'Flights ready';
      setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }, 1400);
    }, 800);
  });
}
