/**
 * HotelBooking API & Data Service
 * Connects to Spring Boot Backend with automatic mock fallback
 */

const API_BASE_URL = 'http://localhost:8080/api';

// Initial Mock Data (Exact match with reference image)
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
    description: 'Khách sạn cao cấp giữa lòng Sài Gòn với tầm nhìn toàn cảnh sông Sài Gòn và dịch vụ 5 sao sang trọng.'
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

export const HotelAPI = {
  /**
   * Fetch featured hotels for home page
   */
  async getFeaturedHotels() {
    try {
      const response = await fetch(`${API_BASE_URL}/hotels/featured`, {
        signal: AbortSignal.timeout(1200)
      });
      if (!response.ok) throw new Error('Network error');
      return await response.json();
    } catch {
      // Graceful fallback to mock data
      return FEATURED_HOTELS;
    }
  },

  /**
   * Search hotels by destination or keyword
   */
  async searchHotels(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/hotels/search?q=${encodeURIComponent(query)}`, {
        signal: AbortSignal.timeout(1200)
      });
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

  /**
   * Submit hotel booking
   */
  async createBooking(bookingData) {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
        signal: AbortSignal.timeout(1500)
      });
      if (!response.ok) throw new Error('Booking failed');
      return await response.json();
    } catch {
      // Simulated response
      const savedBookings = JSON.parse(localStorage.getItem('hotel_bookings') || '[]');
      const newBooking = {
        bookingId: 'HB-' + Math.floor(100000 + Math.random() * 900000),
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED',
        ...bookingData
      };
      savedBookings.unshift(newBooking);
      localStorage.setItem('hotel_bookings', JSON.stringify(savedBookings));
      return { success: true, booking: newBooking };
    }
  },

  /**
   * Authenticate User (Login / Register)
   */
  async authUser(type, credentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        signal: AbortSignal.timeout(1500)
      });
      if (!response.ok) throw new Error('Auth error');
      return await response.json();
    } catch {
      // Mock session
      const user = {
        id: 'usr_' + Date.now(),
        email: credentials.email,
        name: credentials.name || credentials.email.split('@')[0],
        token: 'mock_jwt_token_' + Date.now()
      };
      localStorage.setItem('hotel_user', JSON.stringify(user));
      return { success: true, user };
    }
  },

  getPopularDestinations() {
    return POPULAR_DESTINATIONS;
  }
};
