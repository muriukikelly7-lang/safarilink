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
const formStatus = document.querySelector('.form-status');
const swapButton = document.querySelector('.swap-btn');
const newsletterInput = document.querySelector('.newsletter-box input');
const subscribeButton = document.querySelector('.subscribe-btn');
const fromInput = document.querySelector('.from-field input');
const toInput = document.querySelector('.route-grid .field:nth-child(3) input');
let bookingMode = 'book';

if (tabs.length) {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      bookingMode = tab.dataset.mode || 'book';

      const modeLabels = {
        book: 'Find flights',
        reservation: 'Find reservation',
        'check-in': 'Continue to check-in',
        package: 'Find packages'
      };

      submitButton.textContent = modeLabels[bookingMode];
      if (formStatus) {
        formStatus.textContent = `${tab.textContent.trim()} selected.`;
      }
    });
  });
}

if (swapButton && fromInput && toInput) {
  swapButton.addEventListener('click', () => {
    const fromValue = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = fromValue;
    if (formStatus) {
      formStatus.textContent = 'Departure and destination swapped.';
    }
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
    if (formStatus) {
      formStatus.textContent = 'Preparing your request...';
    }

    setTimeout(() => {
      const successMessages = {
        book: 'Flight search ready. Select your preferred flight next.',
        reservation: 'Reservation search ready.',
        'check-in': 'Check-in request ready.',
        package: 'Package search ready.'
      };
      submitButton.textContent = 'Ready';
      if (formStatus) {
        formStatus.textContent = successMessages[bookingMode];
      }
      setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }, 1400);
    }, 800);
  });
}

if (subscribeButton && newsletterInput) {
  subscribeButton.addEventListener('click', () => {
    if (!newsletterInput.checkValidity()) {
      newsletterInput.focus();
      newsletterInput.setCustomValidity('Enter a valid email address to subscribe.');
      newsletterInput.reportValidity();
      newsletterInput.setCustomValidity('');
      return;
    }

    subscribeButton.textContent = 'Subscribed';
    newsletterInput.value = '';
    newsletterInput.placeholder = 'Thank you for subscribing';
    window.setTimeout(() => {
      subscribeButton.textContent = 'Subscribe';
      newsletterInput.placeholder = 'Email address';
    }, 1800);
  });
}
