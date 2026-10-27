/**
 * HotelBooking - Unified Interactive Client
 * Supports direct file:// opening and local server hosting
 */

(function () {
  'use strict';

  // API Configuration
  const API_BASE_URL = 'http://localhost:8080/api';

  // Featured Hotels Data (Exact match with reference UI)
  const FEATURED_HOTELS = [
    {
      id: 1,
      name: 'Grand Vista Hotel',
      badge: 'Được yêu thích',
      badgeType: 'featured',
      rating: 4.8,
      reviewsCount: 256,
      location: 'Quận 1, TP. Hồ Chí Minh',
      city: 'TP. Hồ Chí Minh',
      price: 1850000,
      originalPrice: null,
      image: 'assets/images/hotel_grand_vista.jpg',
      isWishlisted: false,
      description: 'Khách sạn cao cấp giữa lòng Sài Gòn với tầm nhìn toàn cảnh ngoạn mục và dịch vụ 5 sao sang trọng.'
    },
    {
      id: 2,
      name: 'Sunrise Resort Phú Quốc',
      badge: 'Giảm giá 20%',
      badgeType: 'discount',
      rating: 4.7,
      reviewsCount: 312,
      location: 'Phú Quốc, Kiên Giang',
      city: 'Phú Quốc',
      price: 2500000,
      originalPrice: 3125000,
      image: 'assets/images/hotel_sunrise_resort.jpg',
      isWishlisted: false,
      description: 'Resort nghỉ dưỡng bên bãi biển cát trắng tinh khôi Phú Quốc với hồ bơi vô cực và khuôn viên nhiệt đới xanh mát.'
    },
    {
      id: 3,
      name: 'The Lumiere Hotel',
      badge: 'Phổ biến',
      badgeType: 'popular',
      rating: 4.6,
      reviewsCount: 196,
      location: 'Đà Nẵng',
      city: 'Đà Nẵng',
      price: 1650000,
      originalPrice: null,
      image: 'assets/images/hotel_the_lumiere.jpg',
      isWishlisted: false,
      description: 'Toạ lạc ngay bờ sông Hàn và trung tâm thành phố Đà Nẵng, thiết kế hiện đại với Sky Bar và hồ bơi tầng thượng.'
    },
    {
      id: 4,
      name: 'Melia Vinpearl Nha Trang',
      badge: 'Mới',
      badgeType: 'new',
      rating: 4.9,
      reviewsCount: 420,
      location: 'Nha Trang, Khánh Hòa',
      city: 'Nha Trang',
      price: 2800000,
      originalPrice: null,
      image: 'assets/images/hotel_melia_nha_trang.jpg',
      isWishlisted: false,
      description: 'Tổ hợp nghỉ dưỡng chuẩn quốc tế hướng biển Nha Trang với bãi biển riêng và hệ thống ẩm thực thượng hạng.'
    }
  ];

  const POPULAR_DESTINATIONS = [
    { name: 'TP. Hồ Chí Minh', count: '1.240 khách sạn' },
    { name: 'Hà Nội', count: '980 khách sạn' },
    { name: 'Đà Nẵng', count: '750 khách sạn' },
    { name: 'Phú Quốc', count: '520 khách sạn' },
    { name: 'Nha Trang', count: '640 khách sạn' },
    { name: 'Đà Lạt', count: '810 khách sạn' }
  ];

  // API Service
  const HotelAPI = {
    async getFeaturedHotels() {
      try {
        const response = await fetch(`${API_BASE_URL}/hotels/featured`, { signal: AbortSignal.timeout(800) });
        if (!response.ok) throw new Error('Network error');
        return await response.json();
      } catch {
        return FEATURED_HOTELS;
      }
    },

    async searchHotels(query) {
      try {
        const response = await fetch(`${API_BASE_URL}/hotels/search?q=${encodeURIComponent(query)}`, { signal: AbortSignal.timeout(800) });
        if (!response.ok) throw new Error('Network error');
        return await response.json();
      } catch {
        const q = (query || '').toLowerCase().trim();
        if (!q) return FEATURED_HOTELS;
        return FEATURED_HOTELS.filter(h =>
          h.name.toLowerCase().includes(q) ||
          h.location.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q)
        );
      }
    },

    async createBooking(bookingData) {
      try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData),
          signal: AbortSignal.timeout(1000)
        });
        if (!response.ok) throw new Error('Booking failed');
        return await response.json();
      } catch {
        const newBooking = {
          bookingId: 'HST-' + Math.floor(100000 + Math.random() * 900000),
          createdAt: new Date().toISOString(),
          status: 'CONFIRMED',
          ...bookingData
        };
        try {
          const saved = JSON.parse(localStorage.getItem('hotel_bookings') || '[]');
          saved.unshift(newBooking);
          localStorage.setItem('hotel_bookings', JSON.stringify(saved));
        } catch (e) {
          console.warn('Storage not available', e);
        }
        return { success: true, booking: newBooking };
      }
    },

    async authUser(type, credentials) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
          signal: AbortSignal.timeout(1000)
        });
        if (!response.ok) throw new Error('Auth error');
        return await response.json();
      } catch {
        const user = {
          id: 'usr_' + Date.now(),
          email: credentials.email,
          name: credentials.name || credentials.email.split('@')[0],
          token: 'jwt_mock_' + Date.now()
        };
        try {
          localStorage.setItem('hotel_user', JSON.stringify(user));
        } catch (e) {
          console.warn('Storage not available', e);
        }
        return { success: true, user };
      }
    }
  };

  // State
  let savedUser = null;
  try {
    savedUser = JSON.parse(localStorage.getItem('hotel_user') || 'null');
  } catch (e) {
    savedUser = null;
  }

  const state = {
    destination: '',
    checkInDate: '2025-10-27',
    checkOutDate: '2025-10-28',
    adults: 2,
    children: 0,
    rooms: 1,
    hotels: [...FEATURED_HOTELS],
    selectedHotel: null,
    selectedHotelTotal: null,
    currentUser: savedUser
  };

  // Helper Functions
  function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

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
    }, 3800);
  }

  // DOM Loaded
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
     NAVBAR
     ========================================================================== */
  function initNavbar() {
    const header = document.querySelector('.site-header');
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });

    if (mobileToggle && navMenu) {
      mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
    }

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
          try { localStorage.removeItem('hotel_user'); } catch (e) {}
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
     SEARCH WIDGET
     ========================================================================== */
  function initSearchWidget() {
    const locationInput = document.getElementById('locationInput');
    const locationPopover = document.getElementById('locationPopover');
    const checkInInput = document.getElementById('checkInInput');
    const checkOutInput = document.getElementById('checkOutInput');
    const checkInDisplay = document.getElementById('checkInDisplay');
    const checkOutDisplay = document.getElementById('checkOutDisplay');
    const guestField = document.getElementById('guestField');
    const guestPopover = document.getElementById('guestPopover');
    const guestDisplay = document.getElementById('guestDisplay');
    const searchSubmitBtn = document.getElementById('btnSearchSubmit');

    // Popular destinations list
    const popoverList = document.getElementById('locationSuggestions');
    if (popoverList) {
      popoverList.innerHTML = POPULAR_DESTINATIONS.map(d => `
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
          if (locationInput) locationInput.value = val;
          state.destination = val;
          locationPopover?.classList.remove('active');
          e.stopPropagation();
        });
      });
    }

    locationInput?.addEventListener('focus', () => {
      closeAllPopovers();
      locationPopover?.classList.add('active');
    });

    locationInput?.addEventListener('input', (e) => {
      state.destination = e.target.value;
    });

    // Dates
    if (checkInInput && checkInDisplay) {
      checkInInput.value = state.checkInDate;
      checkInDisplay.textContent = formatDateDisplay(state.checkInDate);

      checkInInput.addEventListener('change', (e) => {
        state.checkInDate = e.target.value;
        checkInDisplay.textContent = formatDateDisplay(e.target.value);
        if (state.checkOutDate <= state.checkInDate) {
          const next = new Date(e.target.value);
          next.setDate(next.getDate() + 1);
          const nextStr = next.toISOString().split('T')[0];
          if (checkOutInput) checkOutInput.value = nextStr;
          state.checkOutDate = nextStr;
          if (checkOutDisplay) checkOutDisplay.textContent = formatDateDisplay(nextStr);
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

    // Guest counter
    if (guestField && guestPopover) {
      guestField.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = guestPopover.classList.contains('active');
        closeAllPopovers();
        if (!isActive) guestPopover.classList.add('active');
      });

      const updateSummary = () => {
        if (guestDisplay) {
          guestDisplay.textContent = `${state.adults} người lớn, ${state.children} trẻ em`;
        }
      };

      document.getElementById('adultsMinus')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.adults > 1) {
          state.adults--;
          const el = document.getElementById('adultsCount');
          if (el) el.textContent = state.adults;
          updateSummary();
        }
      });

      document.getElementById('adultsPlus')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.adults < 10) {
          state.adults++;
          const el = document.getElementById('adultsCount');
          if (el) el.textContent = state.adults;
          updateSummary();
        }
      });

      document.getElementById('childrenMinus')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.children > 0) {
          state.children--;
          const el = document.getElementById('childrenCount');
          if (el) el.textContent = state.children;
          updateSummary();
        }
      });

      document.getElementById('childrenPlus')?.addEventListener('click', (e) => {
        e.stopPropagation();
        if (state.children < 6) {
          state.children++;
          const el = document.getElementById('childrenCount');
          if (el) el.textContent = state.children;
          updateSummary();
        }
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-field') && !e.target.closest('.dropdown-popover')) {
        closeAllPopovers();
      }
    });

    function closeAllPopovers() {
      locationPopover?.classList.remove('active');
      guestPopover?.classList.remove('active');
    }

    // Search action
    if (searchSubmitBtn) {
      searchSubmitBtn.addEventListener('click', async () => {
        searchSubmitBtn.disabled = true;
        searchSubmitBtn.innerHTML = `
          <svg style="animation: spin 1s linear infinite;" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

        document.getElementById('hotelsSection')?.scrollIntoView({ behavior: 'smooth' });
        showToast(`Đã tìm thấy ${results.length} khách sạn phù hợp!`);
      });
    }
  }

  /* ==========================================================================
     HOTELS RENDERING
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
          <p style="font-size: 1.1rem; margin-bottom: 16px;">Không tìm thấy khách sạn nào khớp với từ khóa tìm kiếm.</p>
          <button id="btnResetSearch" class="btn-pill btn-primary">Xem tất cả khách sạn</button>
        </div>
      `;
      document.getElementById('btnResetSearch')?.addEventListener('click', () => {
        const inp = document.getElementById('locationInput');
        if (inp) inp.value = '';
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

    // Wishlist events
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
          showToast(h.isWishlisted ? `Đã thêm ${h.name} vào Yêu thích!` : `Đã bỏ ${h.name} khỏi Yêu thích.`, 'info');
        }
      });
    });

    // Booking button events
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
     BOOKING MODAL
     ========================================================================== */
  function initBookingModal() {
    const modal = document.getElementById('bookingModal');
    const closeBtn = document.getElementById('closeBookingModal');
    const form = document.getElementById('bookingForm');

    closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Đang xử lý đặt phòng...';
      }

      const bookingPayload = {
        hotelId: state.selectedHotel?.id,
        hotelName: state.selectedHotel?.name,
        guestName: document.getElementById('bookGuestName')?.value,
        guestPhone: document.getElementById('bookGuestPhone')?.value,
        guestEmail: document.getElementById('bookGuestEmail')?.value,
        checkIn: document.getElementById('bookCheckIn')?.value,
        checkOut: document.getElementById('bookCheckOut')?.value,
        roomType: document.getElementById('bookRoomType')?.value,
        totalPrice: state.selectedHotelTotal || state.selectedHotel?.price
      };

      const res = await HotelAPI.createBooking(bookingPayload);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Xác nhận đặt phòng';
      }
      modal?.classList.remove('active');

      if (res.success) {
        showToast(`Chúc mừng! Đặt phòng thành công tại ${state.selectedHotel?.name}. Mã đặt: ${res.booking.bookingId}`);
      } else {
        showToast('Có lỗi xảy ra khi đặt phòng, vui lòng thử lại!', 'error');
      }
    });
  }

  function openBookingModal(hotel) {
    state.selectedHotel = hotel;
    const modal = document.getElementById('bookingModal');
    if (!modal) return;

    const elName = document.getElementById('modalHotelName');
    const elPrice = document.getElementById('modalHotelPrice');
    const elLoc = document.getElementById('modalHotelLocation');
    const elImg = document.getElementById('modalHotelImg');

    if (elName) elName.textContent = hotel.name;
    if (elPrice) elPrice.textContent = `${formatVND(hotel.price)} / đêm`;
    if (elLoc) elLoc.textContent = hotel.location;
    if (elImg) elImg.src = hotel.image;

    const inInp = document.getElementById('bookCheckIn');
    const outInp = document.getElementById('bookCheckOut');
    if (inInp) inInp.value = state.checkInDate;
    if (outInp) outInp.value = state.checkOutDate;

    if (state.currentUser) {
      const gName = document.getElementById('bookGuestName');
      const gEmail = document.getElementById('bookGuestEmail');
      if (gName) gName.value = state.currentUser.name || '';
      if (gEmail) gEmail.value = state.currentUser.email || '';
    }

    calculateBookingSummary();

    if (inInp) inInp.onchange = calculateBookingSummary;
    if (outInp) outInp.onchange = calculateBookingSummary;
    const roomType = document.getElementById('bookRoomType');
    if (roomType) roomType.onchange = calculateBookingSummary;

    modal.classList.add('active');
  }

  function calculateBookingSummary() {
    if (!state.selectedHotel) return;

    const inVal = document.getElementById('bookCheckIn')?.value;
    const outVal = document.getElementById('bookCheckOut')?.value;

    let nights = 1;
    if (inVal && outVal) {
      const checkIn = new Date(inVal);
      const checkOut = new Date(outVal);
      const diff = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      nights = Math.max(1, isNaN(diff) ? 1 : diff);
    }

    const roomMultiplier = parseFloat(document.getElementById('bookRoomType')?.value) || 1.0;
    const total = state.selectedHotel.price * nights * roomMultiplier;
    state.selectedHotelTotal = total;

    const elNights = document.getElementById('summaryNights');
    const elTotal = document.getElementById('summaryTotalPrice');
    if (elNights) elNights.textContent = `${nights} đêm`;
    if (elTotal) elTotal.textContent = formatVND(total);
  }

  /* ==========================================================================
     AUTH MODAL
     ========================================================================== */
  function initAuthModal() {
    const modal = document.getElementById('authModal');
    const closeBtn = document.getElementById('closeAuthModal');
    const tabLogin = document.getElementById('tabLogin');
    const tabRegister = document.getElementById('tabRegister');
    const formLogin = document.getElementById('formLogin');
    const formRegister = document.getElementById('formRegister');

    closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    tabLogin?.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister?.classList.remove('active');
      if (formLogin) formLogin.style.display = 'block';
      if (formRegister) formRegister.style.display = 'none';
    });

    tabRegister?.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin?.classList.remove('active');
      if (formRegister) formRegister.style.display = 'block';
      if (formLogin) formLogin.style.display = 'none';
    });

    formLogin?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail')?.value;
      const password = document.getElementById('loginPassword')?.value;

      const res = await HotelAPI.authUser('login', { email, password });
      if (res.success) {
        state.currentUser = res.user;
        updateUserUI();
        modal?.classList.remove('active');
        showToast(`Đăng nhập thành công! Chào mừng ${res.user.name}`);
      }
    });

    formRegister?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName')?.value;
      const email = document.getElementById('regEmail')?.value;
      const password = document.getElementById('regPassword')?.value;

      const res = await HotelAPI.authUser('register', { name, email, password });
      if (res.success) {
        state.currentUser = res.user;
        updateUserUI();
        modal?.classList.remove('active');
        showToast(`Đăng ký tài khoản thành công! Chào mừng ${res.user.name}`);
      }
    });
  }

  function openAuthModal(mode = 'login') {
    const modal = document.getElementById('authModal');
    if (!modal) return;
    modal.classList.add('active');

    if (mode === 'register') {
      document.getElementById('tabRegister')?.click();
    } else {
      document.getElementById('tabLogin')?.click();
    }
  }

  /* ==========================================================================
     QUICK SEARCH & LINKS
     ========================================================================== */
  function initQuickSearch() {
    document.getElementById('btnNavSearch')?.addEventListener('click', () => {
      const locationInput = document.getElementById('locationInput');
      locationInput?.focus();
      locationInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    document.getElementById('btnCtaExplore')?.addEventListener('click', () => {
      document.getElementById('hotelsSection')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

})();
