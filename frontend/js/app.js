import { HotelAPI } from './api.js';

/**
 * Main Application State
 */
const state = {
  destination: '',
  checkInDate: '2025-10-27',
  checkOutDate: '2025-10-28',
  adults: 2,
  children: 0,
  rooms: 1,
  hotels: [],
  selectedHotel: null,
  currentUser: JSON.parse(localStorage.getItem('hotel_user') || 'null')
};

// Format currency
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

// Format date to DD/MM/YYYY
function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

// Toast notification helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
    </span>
    <span class="toast-text">${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
  initNavbar();
  initSearchWidget();
  initAuthModal();
  initBookingModal();
  initQuickSearch();
  await loadFeaturedHotels();
  updateUserUI();
});

/* ==========================================================================
   NAVBAR INTERACTIONS
   ========================================================================== */
function initNavbar() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // Smooth scroll for nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
          document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          if (navMenu) navMenu.classList.remove('active');
        }
      }
    });
  });
}

function updateUserUI() {
  const loginBtn = document.getElementById('btnNavLogin');
  const registerBtn = document.getElementById('btnNavRegister');

  if (state.currentUser && loginBtn && registerBtn) {
    loginBtn.textContent = state.currentUser.name;
    loginBtn.onclick = () => {
      if (confirm(`Xin chào ${state.currentUser.name}! Bạn có muốn đăng xuất?`)) {
        localStorage.removeItem('hotel_user');
        state.currentUser = null;
        updateUserUI();
        showToast('Đã đăng xuất thành công', 'info');
      }
    };
    registerBtn.style.display = 'none';
  } else if (loginBtn && registerBtn) {
    loginBtn.textContent = 'Đăng nhập';
    loginBtn.onclick = () => openAuthModal('login');
    registerBtn.style.display = 'inline-flex';
    registerBtn.onclick = () => openAuthModal('register');
  }
}

/* ==========================================================================
   SEARCH WIDGET & AUTOCOMPLETE & GUEST COUNTER
   ========================================================================== */
function initSearchWidget() {
  const locationInput = document.getElementById('locationInput');
  const locationPopover = document.getElementById('locationPopover');
  const locationField = document.getElementById('locationField');

  const checkInInput = document.getElementById('checkInInput');
  const checkOutInput = document.getElementById('checkOutInput');
  const checkInDisplay = document.getElementById('checkInDisplay');
  const checkOutDisplay = document.getElementById('checkOutDisplay');

  const guestField = document.getElementById('guestField');
  const guestPopover = document.getElementById('guestPopover');
  const guestDisplay = document.getElementById('guestDisplay');

  const searchSubmitBtn = document.getElementById('btnSearchSubmit');

  // Location suggestions setup
  const popoverList = document.getElementById('locationSuggestions');
  if (popoverList) {
    const destinations = HotelAPI.getPopularDestinations();
    popoverList.innerHTML = destinations.map(d => `
      <div class="location-item" data-value="${d.name}">
        <span class="field-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </span>
        <div>
          <div class="location-name">${d.name}</div>
          <div class="location-desc">${d.count}</div>
        </div>
      </div>
    `).join('');

    popoverList.querySelectorAll('.location-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const val = item.getAttribute('data-value');
        locationInput.value = val;
        state.destination = val;
        locationPopover.classList.remove('active');
        e.stopPropagation();
      });
    });
  }

  locationInput.addEventListener('focus', () => {
    closeAllPopovers();
    locationPopover.classList.add('active');
  });

  locationInput.addEventListener('input', (e) => {
    state.destination = e.target.value;
  });

  // Date pickers
  if (checkInInput && checkInDisplay) {
    checkInInput.value = state.checkInDate;
    checkInDisplay.textContent = formatDateDisplay(state.checkInDate);

    checkInInput.addEventListener('change', (e) => {
      state.checkInDate = e.target.value;
      checkInDisplay.textContent = formatDateDisplay(e.target.value);
      if (state.checkOutDate <= state.checkInDate) {
        // Automatically set check-out to next day
        const nextDay = new Date(e.target.value);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];
        checkOutInput.value = nextDayStr;
        state.checkOutDate = nextDayStr;
        checkOutDisplay.textContent = formatDateDisplay(nextDayStr);
      }
    });
  }

  if (checkOutInput && checkOutDisplay) {
    checkOutInput.value = state.checkOutDate;
    checkOutDisplay.textContent = formatDateDisplay(state.checkOutDate);

    checkOutInput.addEventListener('change', (e) => {
      state.checkOutDate = e.target.value;
      checkOutDisplay.textContent = formatDateDisplay(e.target.value);
    });
  }

  // Guest popover stepper
  if (guestField && guestPopover) {
    guestField.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = guestPopover.classList.contains('active');
      closeAllPopovers();
      if (!isActive) guestPopover.classList.add('active');
    });

    const updateGuestSummary = () => {
      guestDisplay.textContent = `${state.adults} người lớn, ${state.children} trẻ em`;
    };

    // Adults
    document.getElementById('adultsMinus')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.adults > 1) {
        state.adults--;
        document.getElementById('adultsCount').textContent = state.adults;
        updateGuestSummary();
      }
    });
    document.getElementById('adultsPlus')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.adults < 10) {
        state.adults++;
        document.getElementById('adultsCount').textContent = state.adults;
        updateGuestSummary();
      }
    });

    // Children
    document.getElementById('childrenMinus')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.children > 0) {
        state.children--;
        document.getElementById('childrenCount').textContent = state.children;
        updateGuestSummary();
      }
    });
    document.getElementById('childrenPlus')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.children < 6) {
        state.children++;
        document.getElementById('childrenCount').textContent = state.children;
        updateGuestSummary();
      }
    });
  }

  // Click outside to close popovers
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-field') && !e.target.closest('.dropdown-popover')) {
      closeAllPopovers();
    }
  });

  function closeAllPopovers() {
    locationPopover?.classList.remove('active');
    guestPopover?.classList.remove('active');
  }

  // Search Submit
  if (searchSubmitBtn) {
    searchSubmitBtn.addEventListener('click', async () => {
      searchSubmitBtn.disabled = true;
      searchSubmitBtn.innerHTML = `
        <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-linecap="round"></circle>
        </svg>
        Đang tìm...
      `;

      const results = await HotelAPI.searchHotels(state.destination);
      renderHotelCards(results);

      searchSubmitBtn.disabled = false;
      searchSubmitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        Tìm kiếm
      `;

      // Smooth scroll to featured hotels
      document.getElementById('hotelsSection')?.scrollIntoView({ behavior: 'smooth' });
      showToast(`Đã tìm thấy ${results.length} khách sạn phù hợp!`);
    });
  }
}

/* ==========================================================================
   FEATURED HOTELS RENDERING
   ========================================================================== */
async function loadFeaturedHotels() {
  state.hotels = await HotelAPI.getFeaturedHotels();
  renderHotelCards(state.hotels);
}

function renderHotelCards(hotels) {
  const grid = document.getElementById('hotelsGrid');
  if (!grid) return;

  if (hotels.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 0; color: var(--text-secondary);">
        <p style="font-size: 1.1rem; margin-bottom: 12px;">Không tìm thấy khách sạn nào khớp với tìm kiếm của bạn.</p>
        <button id="btnResetSearch" class="btn-pill btn-primary">Xem tất cả khách sạn</button>
      </div>
    `;
    document.getElementById('btnResetSearch')?.addEventListener('click', () => {
      document.getElementById('locationInput').value = '';
      state.destination = '';
      loadFeaturedHotels();
    });
    return;
  }

  grid.innerHTML = hotels.map(hotel => `
    <div class="hotel-card" data-id="${hotel.id}">
      <div class="hotel-card-media">
        <span class="card-badge badge-${hotel.badgeType}">${hotel.badge}</span>
        <button class="wishlist-btn ${hotel.isWishlisted ? 'active' : ''}" data-id="${hotel.id}" title="Yêu thích">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${hotel.isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <img src="${hotel.image}" alt="${hotel.name}" class="hotel-img" loading="lazy">
      </div>
      <div class="hotel-card-body">
        <h3 class="hotel-name">${hotel.name}</h3>
        <div class="hotel-rating">
          <span class="rating-star">★</span>
          <span class="rating-score">${hotel.rating}</span>
          <span class="rating-reviews">(${hotel.reviewsCount} đánh giá)</span>
        </div>
        <div class="hotel-location">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span>${hotel.location}</span>
        </div>
        <div class="hotel-pricing">
          <span class="price-main">${formatVND(hotel.price)}</span>
          <span class="price-unit">/ đêm</span>
          ${hotel.originalPrice ? `<span class="price-original">${formatVND(hotel.originalPrice)}</span>` : ''}
        </div>
        <button class="btn-book" data-hotel-id="${hotel.id}">
          Đặt phòng ngay
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `).join('');

  // Wishlist clicks
  grid.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-id'));
      const h = state.hotels.find(x => x.id === id);
      if (h) {
        h.isWishlisted = !h.isWishlisted;
        btn.classList.toggle('active', h.isWishlisted);
        const svg = btn.querySelector('svg');
        svg.setAttribute('fill', h.isWishlisted ? 'currentColor' : 'none');
        showToast(h.isWishlisted ? `Đã thêm ${h.name} vào mục Yêu thích!` : `Đã bỏ ${h.name} khỏi Yêu thích.`, 'info');
      }
    });
  });

  // Booking buttons
  grid.querySelectorAll('.btn-book').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.getAttribute('data-hotel-id'));
      const hotel = state.hotels.find(h => h.id === id);
      if (hotel) {
        openBookingModal(hotel);
      }
    });
  });
}

/* ==========================================================================
   BOOKING MODAL & FLOW
   ========================================================================== */
function initBookingModal() {
  const modal = document.getElementById('bookingModal');
  const closeBtn = document.getElementById('closeBookingModal');
  const form = document.getElementById('bookingForm');

  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang xử lý đặt phòng...';

    const bookingPayload = {
      hotelId: state.selectedHotel.id,
      hotelName: state.selectedHotel.name,
      guestName: document.getElementById('bookGuestName').value,
      guestPhone: document.getElementById('bookGuestPhone').value,
      guestEmail: document.getElementById('bookGuestEmail').value,
      checkIn: document.getElementById('bookCheckIn').value,
      checkOut: document.getElementById('bookCheckOut').value,
      roomType: document.getElementById('bookRoomType').value,
      totalPrice: state.selectedHotelTotal || state.selectedHotel.price
    };

    const res = await HotelAPI.createBooking(bookingPayload);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Xác nhận đặt phòng';
    modal.classList.remove('active');

    if (res.success) {
      showToast(`Chúc mừng! Đặt phòng thành công tại ${state.selectedHotel.name}. Mã đặt phòng: ${res.booking.bookingId}`);
    } else {
      showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
    }
  });
}

function openBookingModal(hotel) {
  state.selectedHotel = hotel;
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  document.getElementById('modalHotelName').textContent = hotel.name;
  document.getElementById('modalHotelPrice').textContent = `${formatVND(hotel.price)} / đêm`;
  document.getElementById('modalHotelLocation').textContent = hotel.location;
  document.getElementById('modalHotelImg').src = hotel.image;

  document.getElementById('bookCheckIn').value = state.checkInDate;
  document.getElementById('bookCheckOut').value = state.checkOutDate;

  // Auto-fill logged in user info
  if (state.currentUser) {
    document.getElementById('bookGuestName').value = state.currentUser.name || '';
    document.getElementById('bookGuestEmail').value = state.currentUser.email || '';
  }

  calculateBookingSummary();

  document.getElementById('bookCheckIn').onchange = calculateBookingSummary;
  document.getElementById('bookCheckOut').onchange = calculateBookingSummary;
  document.getElementById('bookRoomType').onchange = calculateBookingSummary;

  modal.classList.add('active');
}

function calculateBookingSummary() {
  if (!state.selectedHotel) return;

  const checkIn = new Date(document.getElementById('bookCheckIn').value);
  const checkOut = new Date(document.getElementById('bookCheckOut').value);
  let nights = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
  if (isNaN(nights) || nights <= 0) nights = 1;

  const roomMultiplier = parseFloat(document.getElementById('bookRoomType').value) || 1.0;
  const total = state.selectedHotel.price * nights * roomMultiplier;
  state.selectedHotelTotal = total;

  document.getElementById('summaryNights').textContent = `${nights} đêm`;
  document.getElementById('summaryTotalPrice').textContent = formatVND(total);
}

/* ==========================================================================
   AUTHENTICATION MODAL
   ========================================================================== */
function initAuthModal() {
  const modal = document.getElementById('authModal');
  const closeBtn = document.getElementById('closeAuthModal');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');

  closeBtn?.addEventListener('click', () => modal.classList.remove('active'));
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  tabLogin?.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    formLogin.style.display = 'block';
    formRegister.style.display = 'none';
  });

  tabRegister?.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    formRegister.style.display = 'block';
    formLogin.style.display = 'none';
  });

  // Login Submit
  formLogin?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const res = await HotelAPI.authUser('login', { email, password });
    if (res.success) {
      state.currentUser = res.user;
      updateUserUI();
      modal.classList.remove('active');
      showToast(`Đăng nhập thành công! Chào mừng ${res.user.name}`);
    }
  });

  // Register Submit
  formRegister?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    const res = await HotelAPI.authUser('register', { name, email, password });
    if (res.success) {
      state.currentUser = res.user;
      updateUserUI();
      modal.classList.remove('active');
      showToast(`Đăng ký tài khoản thành công! Chào mừng ${res.user.name}`);
    }
  });
}

function openAuthModal(mode = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('active');

  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');

  if (mode === 'register') {
    tabRegister?.click();
  } else {
    tabLogin?.click();
  }
}

/* ==========================================================================
   QUICK SEARCH MODAL (NAVBAR SEARCH ICON)
   ========================================================================== */
function initQuickSearch() {
  const btn = document.getElementById('btnNavSearch');
  btn?.addEventListener('click', () => {
    const locationInput = document.getElementById('locationInput');
    locationInput?.focus();
    locationInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // CTA Button "Khám phá ngay" scrolls to hotels
  document.getElementById('btnCtaExplore')?.addEventListener('click', () => {
    document.getElementById('hotelsSection')?.scrollIntoView({ behavior: 'smooth' });
  });
}
