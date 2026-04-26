// =============================================
//   HP GAS CONNECT - Main JavaScript File
// =============================================

// ---- Generate Unique Order ID ----
function generateOrderID() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HPG${year}${month}${day}${rand}`;
}

// ---- Generate Unique Complaint ID ----
function generateComplaintID() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CMP${year}${month}${day}${rand}`;
}

// ---- Format Date Time ----
function formatDateTime(date) {
  const options = {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  };
  return date.toLocaleString('en-IN', options);
}

// ---- Get Future Date ----
function getFutureDate(hoursAhead) {
  const date = new Date();
  date.setHours(date.getHours() + hoursAhead);
  return date;
}

// =============================================
//   BOOKING FORM - Submit Handler
// =============================================
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Get values
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const consumer = document.getElementById('consumerNo').value.trim();
    const address = document.getElementById('address').value.trim();
    const cylType = document.getElementById('cylinderType').value;
    const prefDate = document.getElementById('prefDate').value;

    // Basic validation
    if (!name || !phone || !consumer || !address || !cylType) {
      showAlert('bookingAlert', '⚠️ Please fill all required fields!', 'danger');
      return;
    }

    if (phone.length !== 10 || isNaN(phone)) {
      showAlert('bookingAlert', '⚠️ Please enter a valid 10-digit phone number!', 'danger');
      return;
    }

    // Generate Order ID
    const orderID = generateOrderID();
    const now = new Date();
    const deliveryTime = getFutureDate(24);

    // Store booking data in localStorage
    const bookingData = {
      orderID,
      name,
      phone,
      consumer,
      address,
      cylType,
      prefDate: prefDate || deliveryTime.toDateString(),
      bookedAt: now.toISOString(),
      status: 'booked'
    };
    localStorage.setItem(orderID, JSON.stringify(bookingData));

    // Show success
    document.getElementById('displayOrderID').textContent = orderID;
    document.getElementById('displayName').textContent = name;
    document.getElementById('displayCylType').textContent = cylType;
    document.getElementById('displayDelivery').textContent = formatDateTime(deliveryTime);
    document.getElementById('orderSuccess').classList.add('show');

    // Reset form
    bookingForm.reset();

    // Scroll to success
    document.getElementById('orderSuccess').scrollIntoView({ behavior: 'smooth' });
  });
}

// =============================================
//   TRACKING - Order Lookup
// =============================================
const trackBtn = document.getElementById('trackBtn');
if (trackBtn) {
  trackBtn.addEventListener('click', function () {
    const input = document.getElementById('trackOrderID').value.trim().toUpperCase();

    if (!input) {
      showAlert('trackAlert', '⚠️ Please enter your Order ID!', 'danger');
      return;
    }

    // Try localStorage first (real booking)
    let booking = localStorage.getItem(input);
    let data;

    if (booking) {
      data = JSON.parse(booking);
    } else if (input.startsWith('HPG')) {
      // Demo data for exhibition
      data = generateDemoData(input);
    } else {
      showAlert('trackAlert', '❌ Order ID not found! Please check and try again.', 'danger');
      document.getElementById('trackingResult').classList.remove('show');
      return;
    }

    displayTracking(data);
  });
}

function generateDemoData(orderID) {
  const deliveryBoys = [
    { name: 'Ramesh Patil', phone: '9876543210' },
    { name: 'Suresh Kumar', phone: '9823456789' },
    { name: 'Mahesh Shinde', phone: '9765432109' }
  ];
  const boy = deliveryBoys[Math.floor(Math.random() * deliveryBoys.length)];
  const now = new Date();

  return {
    orderID,
    name: 'Demo Customer',
    cylType: '14.2 KG Domestic',
    address: 'Nashik, Maharashtra',
    bookedAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    deliveryBoy: boy,
    status: 'out_for_delivery'
  };
}

function displayTracking(data) {
  const result = document.getElementById('trackingResult');
  const now = new Date();
  const booked = new Date(data.bookedAt);
  const confirmed = new Date(booked.getTime() + 30 * 60000);
  const dispatched = new Date(booked.getTime() + 90 * 60000);
  const outForDelivery = new Date(booked.getTime() + 150 * 60000);
  const expectedDelivery = new Date(booked.getTime() + 24 * 60 * 60000);

  // Set order info
  document.getElementById('resultOrderID').textContent = data.orderID;
  document.getElementById('resultCylType').textContent = data.cylType || '14.2 KG Domestic';
  document.getElementById('resultCustomer').textContent = data.name;
  document.getElementById('resultAddress').textContent = data.address || 'Nashik, Maharashtra';
  document.getElementById('expectedDelivery').textContent = formatDateTime(expectedDelivery);

  // Set timeline
  setStep('step1', 'done', formatDateTime(booked));
  setStep('step2', now >= confirmed ? 'done' : 'pending', now >= confirmed ? formatDateTime(confirmed) : 'Pending');
  setStep('step3', now >= dispatched ? 'done' : 'pending', now >= dispatched ? formatDateTime(dispatched) : 'Pending');

  if (now >= outForDelivery) {
    setStep('step4', 'active', formatDateTime(outForDelivery));
    setStep('step5', 'pending', 'Expected: ' + formatDateTime(expectedDelivery));
  } else {
    setStep('step4', 'pending', 'Pending');
    setStep('step5', 'pending', 'Expected: ' + formatDateTime(expectedDelivery));
  }

  // Delivery boy info
  if (data.deliveryBoy) {
    document.getElementById('deliveryBoyName').textContent = data.deliveryBoy.name;
    document.getElementById('deliveryBoyPhone').textContent = data.deliveryBoy.phone;
    document.getElementById('deliveryBoyCard').style.display = 'flex';
  }

  result.classList.add('show');
  result.scrollIntoView({ behavior: 'smooth' });
}

function setStep(stepId, status, time) {
  const step = document.getElementById(stepId);
  if (!step) return;
  const dot = step.querySelector('.step-dot');
  const timeEl = step.querySelector('.step-time');

  dot.className = 'step-dot ' + status;
  if (status === 'done') dot.innerHTML = '✓';
  else if (status === 'active') dot.innerHTML = '🚚';
  else dot.innerHTML = '○';

  if (timeEl) timeEl.textContent = time;
}

// =============================================
//   COMPLAINT FORM
// =============================================

// Complaint type selection
const complaintTypeCards = document.querySelectorAll('.complaint-type-card');
complaintTypeCards.forEach(card => {
  card.addEventListener('click', function () {
    complaintTypeCards.forEach(c => c.classList.remove('selected'));
    this.classList.add('selected');
    const hiddenInput = document.getElementById('selectedComplaintType');
    if (hiddenInput) hiddenInput.value = this.dataset.type;
  });
});

// File upload display
const photoUpload = document.getElementById('photoUpload');
if (photoUpload) {
  photoUpload.addEventListener('change', function () {
    const fileName = this.files[0] ? this.files[0].name : '';
    const label = document.getElementById('uploadLabel');
    if (label && fileName) {
      label.textContent = '📎 ' + fileName + ' selected!';
    }
  });
}

// Complaint form submit
const complaintForm = document.getElementById('complaintForm');
if (complaintForm) {
  complaintForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('cName').value.trim();
    const phone = document.getElementById('cPhone').value.trim();
    const consumer = document.getElementById('cConsumerNo').value.trim();
    const type = document.getElementById('selectedComplaintType') ?
      document.getElementById('selectedComplaintType').value : '';
    const desc = document.getElementById('cDescription').value.trim();

    if (!name || !phone || !consumer || !desc) {
      showAlert('complaintAlert', '⚠️ Please fill all required fields!', 'danger');
      return;
    }

    if (!type) {
      showAlert('complaintAlert', '⚠️ Please select a complaint type!', 'danger');
      return;
    }

    const complaintID = generateComplaintID();
    const now = new Date();

    // Store complaint
    const complaintData = { complaintID, name, phone, consumer, type, desc, submittedAt: now.toISOString(), status: 'submitted' };
    localStorage.setItem(complaintID, JSON.stringify(complaintData));

    // Show success
    document.getElementById('displayComplaintID').textContent = complaintID;
    document.getElementById('displayComplaintType').textContent = type;
    document.getElementById('displayComplaintTime').textContent = formatDateTime(now);
    document.getElementById('complaintSuccess').classList.add('show');

    complaintForm.reset();
    complaintTypeCards.forEach(c => c.classList.remove('selected'));
    document.getElementById('complaintSuccess').scrollIntoView({ behavior: 'smooth' });
  });
}

// =============================================
//   CONTACT FORM
// =============================================
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    showAlert('contactAlert', '✅ Your message has been sent! We will contact you soon.', 'success');
    contactForm.reset();
  });
}

// =============================================
//   UTILITY: Show Alert
// =============================================
function showAlert(containerId, message, type) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <div style="
      background: ${type === 'danger' ? '#f8d7da' : '#d4edda'};
      color: ${type === 'danger' ? '#721c24' : '#155724'};
      border: 1px solid ${type === 'danger' ? '#f5c6cb' : '#c3e6cb'};
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 16px;
    ">${message}</div>
  `;
  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

// =============================================
//   ACTIVE NAV LINK HIGHLIGHT
// =============================================
document.addEventListener('DOMContentLoaded', function () {
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
});

// =============================================
//   SMOOTH SCROLL
// =============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});