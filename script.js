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
const newsletterStatus = document.querySelector('.newsletter-status');
const fromInput = document.querySelector('.from-field input');
const toInput = document.querySelector('.route-grid .field:nth-child(3) input');
const adultCount = document.querySelector('#adult-count');
const childCount = document.querySelector('#child-count');
const childAges = document.querySelector('#child-ages');
const fareSummary = document.querySelector('#fare-summary');
const flightResult = document.querySelector('#flight-result');
const resultRoute = document.querySelector('#result-route');
const resultDetails = document.querySelector('#result-details');
const acceptFareButton = document.querySelector('#accept-fare');
const customerDetails = document.querySelector('#customer-details');
const customerName = document.querySelector('#customer-name');
const customerId = document.querySelector('#customer-id');
const customerEmail = document.querySelector('#customer-email');
const confirmBookingButton = document.querySelector('#confirm-booking');
const bookingStatus = document.querySelector('#booking-status');
const closeCustomerDetails = document.querySelector('#close-customer-details');
const seatSelection = document.querySelector('#seat-selection');
const closeSeatSelection = document.querySelector('#close-seat-selection');
const seatGrid = document.querySelector('#seat-grid');
const seatStatus = document.querySelector('#seat-status');
const seatRouteSummary = document.querySelector('#seat-route-summary');
const confirmSeatsButton = document.querySelector('#confirm-seats');
let bookingMode = 'book';

const fareRoutes = document.querySelectorAll('.fare-table-wrap tbody tr');
const bookTab = document.querySelector('.tab[data-mode="book"]');

const cleanLocation = (value) => value.replace(/\s*\([^)]*\)/g, '').trim().toLowerCase();

const fareInventory = Array.from(fareRoutes).map((row) => ({
  route: row.cells[0]?.textContent.trim() || '',
  duration: row.cells[1]?.textContent.trim() || '',
  fare: row.cells[2]?.textContent.trim() || ''
}));

const findFare = () => {
  const from = cleanLocation(fromInput?.value || '');
  const to = cleanLocation(toInput?.value || '');
  return fareInventory.find((item) => {
    const [origin, destination] = item.route.split('↔').map((part) => cleanLocation(part));
    return (origin === from && destination === to) || (origin === to && destination === from);
  });
};

const getFareCalculation = () => {
  const selectedFare = findFare();
  if (!selectedFare) return null;

  const adults = Number(adultCount?.value || 1);
  const rates = Array.from(childAges?.querySelectorAll('select') || [])
    .map((input) => getChildRate(Number(input.value)))
    .filter(Boolean);
  const baseFare = Number(selectedFare.fare.replace(/[^0-9.]/g, ''));
  const currency = selectedFare.fare.startsWith('USD') ? 'USD' : 'KSh';
  const roundtrip = Array.from(tripRadios).some((radio) => radio.checked && radio.nextSibling?.textContent.trim() === 'Roundtrip');
  const tripMultiplier = roundtrip ? 2 : 1;
  const childTotal = rates.reduce((total, rate) => total + (baseFare * rate / 100), 0);
  const total = (baseFare * adults + childTotal) * tripMultiplier;

  return { selectedFare, adults, rates, currency, total, roundtrip };
};

const showFlightResult = () => {
  const fare = findFare();
  if (!flightResult || !resultRoute || !resultDetails) return;

  if (!fare) {
    flightResult.hidden = true;
    if (formStatus) formStatus.textContent = 'No published fare found for this route. Choose a route from the fare list.';
    return;
  }

  resultRoute.textContent = fare.route;
  const calculation = getFareCalculation();
  const totalText = calculation ? ` · Total fare: ${calculation.currency} ${calculation.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '';
  resultDetails.textContent = `${fare.duration} flight time · From ${fare.fare}${totalText}`;
  flightResult.hidden = false;
  if (customerDetails) customerDetails.hidden = true;
  if (formStatus) formStatus.textContent = 'Fare found. Review it, then accept to continue.';
};

const useFareRoute = (row) => {
  const routeText = row.cells[0]?.textContent.trim();
  const routeParts = routeText?.split('↔').map((part) => part.trim());
  if (!routeParts || routeParts.length !== 2 || !fromInput || !toInput) return;

  fromInput.value = routeParts[0];
  toInput.value = routeParts[1];
  if (bookTab) bookTab.click();
  if (formStatus) {
    formStatus.textContent = `${routeParts[0]} to ${routeParts[1]} selected from the fare list.`;
  }
  document.querySelector('#products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

fareRoutes.forEach((row) => {
  row.classList.add('fare-route');
  row.tabIndex = 0;
  row.setAttribute('role', 'button');
  row.setAttribute('aria-label', `Book ${row.cells[0]?.textContent.trim()}`);
  row.addEventListener('click', () => useFareRoute(row));
  row.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      useFareRoute(row);
    }
  });
});

const getChildRate = (age) => {
  if (age >= 3 && age <= 5) return 50;
  if (age >= 6 && age <= 9) return 65;
  if (age >= 10 && age <= 14) return 75;
  if (age >= 15 && age <= 17) return 80;
  return 0;
};

const updateFareSummary = () => {
  if (!adultCount || !childCount || !childAges || !fareSummary) return;

  const calculation = getFareCalculation();
  const rates = calculation?.rates || [];
  const adults = calculation?.adults || Number(adultCount.value);
  const currency = calculation?.currency;
  const total = calculation?.total;

  if (!rates.length) {
    if (calculation) {
      fareSummary.textContent = `${adults} adult${adults === 1 ? '' : 's'} · Total fare: ${currency} ${total.toLocaleString()}${calculation.roundtrip ? ' roundtrip' : ''}.`;
    } else {
      fareSummary.textContent = `${adults} adult${adults === 1 ? '' : 's'} selected. Choose a published route to calculate the total fare.`;
    }
    return;
  }

  fareSummary.textContent = `${adults} adult${adults === 1 ? '' : 's'} + ${rates.length} child${rates.length === 1 ? '' : 'ren'} · Total fare: ${currency} ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}${calculation.roundtrip ? ' roundtrip' : ''}.`;
};

const renderChildAgeInputs = () => {
  if (!childCount || !childAges) return;

  const count = Number(childCount.value);
  childAges.innerHTML = '';
  for (let index = 0; index < count; index += 1) {
    const select = document.createElement('select');
    select.className = 'child-age-select';
    select.setAttribute('aria-label', `Age of child ${index + 1}`);
    select.innerHTML = '<option value="3">Child age</option><option value="4">4 years</option><option value="5">5 years</option><option value="6">6 years</option><option value="7">7 years</option><option value="8">8 years</option><option value="9">9 years</option><option value="10">10 years</option><option value="11">11 years</option><option value="12">12 years</option><option value="13">13 years</option><option value="14">14 years</option><option value="15">15 years</option><option value="16">16 years</option><option value="17">17 years</option>';
    select.addEventListener('change', updateFareSummary);
    childAges.appendChild(select);
  }
  updateFareSummary();
};

if (adultCount && childCount) {
  adultCount.addEventListener('change', updateFareSummary);
  childCount.addEventListener('change', renderChildAgeInputs);
  renderChildAgeInputs();
}

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
    if (bookingMode !== 'book') {
      if (formStatus) formStatus.textContent = `${submitButton.textContent} is ready.`;
      return;
    }

    const originalText = submitButton.textContent;
    submitButton.textContent = 'Searching...';
    submitButton.disabled = true;
    if (formStatus) {
      formStatus.textContent = 'Preparing your request...';
    }

    setTimeout(() => {
      submitButton.textContent = originalText;
      setTimeout(() => {
        submitButton.disabled = false;
        showFlightResult();
      }, 150);
    }, 800);
  });
}

if (acceptFareButton && customerDetails) {
  acceptFareButton.addEventListener('click', () => {
    customerDetails.hidden = false;
    [customerName, customerId, customerEmail].forEach((input) => {
      input.disabled = false;
    });
    customerName.focus();
    if (bookingStatus) bookingStatus.textContent = 'Enter your details to confirm this booking.';
  });
}

if (closeCustomerDetails && customerDetails) {
  closeCustomerDetails.addEventListener('click', () => {
    customerDetails.hidden = true;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !customerDetails.hidden) {
      customerDetails.hidden = true;
      acceptFareButton?.focus();
    }
  });
}

if (confirmBookingButton) {
  confirmBookingButton.addEventListener('click', () => {
    if (!customerName.checkValidity() || !customerId.checkValidity() || !customerEmail.checkValidity()) {
      customerName.form?.reportValidity();
      if (!customerName.value.trim()) customerName.focus();
      return;
    }

    if (seatSelection && seatGrid) {
      customerDetails.hidden = true;
      seatSelection.hidden = false;
      const passengerTotal = Number(adultCount?.value || 1) + Number(childCount?.value || 0);
      const fare = findFare();
      seatRouteSummary.textContent = `${fare?.route || `${fromInput.value} to ${toInput.value}`} · Select ${passengerTotal} seat${passengerTotal === 1 ? '' : 's'}.`;
      seatGrid.querySelectorAll('.seat.selected').forEach((seat) => seat.classList.remove('selected'));
      seatGrid.querySelectorAll('.seat').forEach((seat) => seat.setAttribute('aria-pressed', 'false'));
      seatSelection.dataset.passengerTotal = String(passengerTotal);
      seatStatus.textContent = `Select ${passengerTotal} seat${passengerTotal === 1 ? '' : 's'} to continue.`;
      closeSeatSelection?.focus();
      return;
    }

    const fare = findFare();
    const calculation = getFareCalculation();
    const calculatedFare = calculation
      ? `${calculation.currency} ${calculation.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}${calculation.roundtrip ? ' roundtrip' : ''}`
      : 'To be confirmed';
    const adults = calculation?.adults || Number(adultCount?.value || 1);
    const children = Number(childCount?.value || 0);
    const message = [
      'SafariLink booking request',
      `Route: ${fare?.route || `${fromInput.value} to ${toInput.value}`}`,
      `Departure: ${document.querySelector('.detail-grid input[type="date"]')?.value || 'Not selected'}`,
      `Return: ${returnDateInput?.value || 'One-way'}`,
      `Passenger count: ${adults + children} total (${adults} adult${adults === 1 ? '' : 's'}${children ? `, ${children} child${children === 1 ? '' : 'ren'}` : ''})`,
      `Customer: ${customerName.value}`,
      `ID/Passport: ${customerId.value}`,
      `Email: ${customerEmail.value}`,
      `Published fare: ${fare?.fare || 'To be confirmed'}`,
      `Calculated total: ${calculatedFare}`
    ].join('\n');

    window.open(`https://wa.me/254736388612?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    bookingStatus.textContent = 'Booking request prepared in WhatsApp.';
  });
}

if (seatGrid) {
  const reservedSeats = new Set(['4B', '5C', '6B', '7A', '8D']);
  for (let row = 1; row <= 8; row += 1) {
    const rowNumber = document.createElement('span');
    rowNumber.className = 'seat-row-number';
    rowNumber.textContent = String(row);
    seatGrid.appendChild(rowNumber);

    ['A', 'B', 'C', 'D'].forEach((letter, index) => {
      if (index === 2) {
        const aisle = document.createElement('span');
        aisle.className = 'seat-aisle';
        aisle.setAttribute('aria-hidden', 'true');
        seatGrid.appendChild(aisle);
      }

      const seatName = `${row}${letter}`;
      const seat = document.createElement('button');
      seat.type = 'button';
      seat.className = `seat${reservedSeats.has(seatName) ? ' reserved' : ' available'}`;
      seat.textContent = seatName;
      seat.setAttribute('aria-label', `${seatName}${reservedSeats.has(seatName) ? ', reserved' : ', available'}`);
      seat.setAttribute('aria-pressed', 'false');
      seat.disabled = reservedSeats.has(seatName);
      seat.addEventListener('click', () => {
        const passengerTotal = Number(seatSelection?.dataset.passengerTotal || 1);
        const selectedSeats = seatGrid.querySelectorAll('.seat.selected');
        if (!seat.classList.contains('selected') && selectedSeats.length >= passengerTotal) {
          seatStatus.textContent = `You can select ${passengerTotal} seat${passengerTotal === 1 ? '' : 's'} for this booking.`;
          return;
        }
        seat.classList.toggle('selected');
        seat.setAttribute('aria-pressed', String(seat.classList.contains('selected')));
        const selectedCount = seatGrid.querySelectorAll('.seat.selected').length;
        seatStatus.textContent = selectedCount === passengerTotal
          ? 'All passenger seats selected. Confirm to continue.'
          : `Select ${passengerTotal - selectedCount} more seat${passengerTotal - selectedCount === 1 ? '' : 's'}.`;
      });
      seatGrid.appendChild(seat);
    });
  }
}

const closeSeats = () => {
  if (!seatSelection) return;
  seatSelection.hidden = true;
  customerDetails.hidden = false;
  confirmBookingButton?.focus();
};

closeSeatSelection?.addEventListener('click', closeSeats);

if (confirmSeatsButton) {
  confirmSeatsButton.addEventListener('click', () => {
    const selectedSeats = Array.from(seatGrid?.querySelectorAll('.seat.selected') || []).map((seat) => seat.textContent);
    const passengerTotal = Number(seatSelection?.dataset.passengerTotal || 1);
    if (selectedSeats.length !== passengerTotal) {
      seatStatus.textContent = `Please select ${passengerTotal} seat${passengerTotal === 1 ? '' : 's'} before confirming.`;
      return;
    }

    const fare = findFare();
    const calculation = getFareCalculation();
    const calculatedFare = calculation
      ? `${calculation.currency} ${calculation.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}${calculation.roundtrip ? ' roundtrip' : ''}`
      : 'To be confirmed';
    const adults = calculation?.adults || Number(adultCount?.value || 1);
    const children = Number(childCount?.value || 0);
    const message = [
      'SafariLink booking request',
      `Route: ${fare?.route || `${fromInput.value} to ${toInput.value}`}`,
      `Departure: ${document.querySelector('.detail-grid input[type="date"]')?.value || 'Not selected'}`,
      `Return: ${returnDateInput?.value || 'One-way'}`,
      `Passenger count: ${adults + children} total (${adults} adult${adults === 1 ? '' : 's'}${children ? `, ${children} child${children === 1 ? '' : 'ren'}` : ''})`,
      `Seats: ${selectedSeats.join(', ')}`,
      `Customer: ${customerName.value}`,
      `ID/Passport: ${customerId.value}`,
      `Email: ${customerEmail.value}`,
      `Published fare: ${fare?.fare || 'To be confirmed'}`,
      `Calculated total: ${calculatedFare}`
    ].join('\n');

    window.open(`https://wa.me/254736388612?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
    seatStatus.textContent = 'Booking request prepared in WhatsApp.';
  });
}

if (newsletterInput && subscribeButton) {
  subscribeButton.addEventListener('click', () => {
    if (!newsletterInput.checkValidity()) {
      newsletterInput.reportValidity();
      newsletterStatus.textContent = 'Enter a valid email address to subscribe.';
      return;
    }

    newsletterStatus.textContent = `Thanks. ${newsletterInput.value.trim()} is ready for the SafariLink newsletter.`;
    newsletterInput.value = '';
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
