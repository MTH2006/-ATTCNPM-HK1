-- ==============================================================================
-- HOTEL BOOKING SYSTEM - DATABASE INITIALIZATION SCRIPT (PostgreSQL)
-- ==============================================================================

-- 1. Create Application Database & User (Run if using custom superuser script)
-- CREATE USER hotel_user WITH PASSWORD 'hotel_secure_password_2025';
-- CREATE DATABASE hotel_booking_db OWNER hotel_user;
-- GRANT ALL PRIVILEGES ON DATABASE hotel_booking_db TO hotel_user;

-- Connect to database
\connect hotel_booking_db

-- Clean up existing tables if necessary
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- Bảng Hotels (Khách sạn)
CREATE TABLE hotels (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    badge VARCHAR(100),
    badge_type VARCHAR(50),
    rating NUMERIC(3, 1) DEFAULT 5.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    price BIGINT NOT NULL CHECK (price >= 0),
    original_price BIGINT CHECK (original_price IS NULL OR original_price >= price),
    image VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Rooms (Hạng phòng thuộc khách sạn)
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    hotel_id BIGINT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    room_type VARCHAR(100) NOT NULL,
    price_per_night BIGINT NOT NULL CHECK (price_per_night > 0),
    capacity INTEGER NOT NULL DEFAULT 2 CHECK (capacity > 0),
    total_rooms INTEGER NOT NULL DEFAULT 10 CHECK (total_rooms > 0),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Users (Người dùng / Khách hàng / Quản trị viên)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    user_uuid VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN', 'MANAGER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Bookings (Đơn đặt phòng)
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    hotel_id BIGINT NOT NULL REFERENCES hotels(id) ON DELETE RESTRICT,
    room_id BIGINT REFERENCES rooms(id) ON DELETE SET NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    hotel_name VARCHAR(255) NOT NULL,
    guest_name VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    total_price BIGINT NOT NULL CHECK (total_price >= 0),
    status VARCHAR(30) DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED', 'COMPLETED', 'PENDING')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_booking_dates CHECK (check_out > check_in)
);

-- ==============================================================================
-- 3. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==============================================================================
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_name ON hotels(name);
CREATE INDEX idx_rooms_hotel_id ON rooms(hotel_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_dates ON bookings(hotel_id, check_in, check_out);
CREATE INDEX idx_bookings_guest_email ON bookings(guest_email);
CREATE INDEX idx_users_email ON users(email);

-- ==============================================================================
-- 4. SEED DATA (Dữ liệu mẫu ban đầu)
-- ==============================================================================

-- 4.1 Khách sạn mẫu
INSERT INTO hotels (id, name, badge, badge_type, rating, reviews_count, location, city, price, original_price, image, description) VALUES
(1, 'Grand Vista Hotel', 'Được yêu thích', 'featured', 4.8, 256, 'Quận 1, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', 1850000, NULL, 'assets/images/hotel_grand_vista.jpg', 'Khách sạn cao cấp giữa lòng Sài Gòn với tầm nhìn toàn cảnh sông Sài Gòn và dịch vụ 5 sao sang trọng.'),
(2, 'Sunrise Resort Phú Quốc', 'Giảm giá 20%', 'discount', 4.7, 312, 'Phú Quốc, Kiên Giang', 'Phú Quốc', 2500000, 3125000, 'assets/images/hotel_sunrise_resort.jpg', 'Resort nghỉ dưỡng bên bãi biển cát trắng tinh khôi Phú Quốc với hồ bơi vô cực và khuôn viên nhiệt đới xanh mát.'),
(3, 'The Lumiere Hotel', 'Phổ biến', 'popular', 4.6, 196, 'Đà Nẵng', 'Đà Nẵng', 1650000, NULL, 'assets/images/hotel_the_lumiere.jpg', 'Toạ lạc ngay bờ sông Hàn và trung tâm thành phố Đà Nẵng, thiết kế hiện đại với Sky Bar và hồ bơi tầng thượng.'),
(4, 'Melia Vinpearl Nha Trang', 'Mới', 'new', 4.9, 420, 'Nha Trang, Khánh Hòa', 'Nha Trang', 2800000, NULL, 'assets/images/hotel_melia_nha_trang.jpg', 'Tổ hợp nghỉ dưỡng chuẩn quốc tế hướng biển Nha Trang với bãi biển riêng và hệ thống ẩm thực thượng hạng.');

-- Reset sequence cho hotels
SELECT setval('hotels_id_seq', (SELECT MAX(id) FROM hotels));

-- 4.2 Các hạng phòng mẫu
INSERT INTO rooms (hotel_id, room_type, price_per_night, capacity, total_rooms, description) VALUES
(1, 'Deluxe King City View', 1850000, 2, 15, 'Phòng Deluxe giường King với cửa sổ kính view toàn cảnh thành phố.'),
(1, 'Executive Suite', 3200000, 3, 5, 'Phòng Suite cao cấp với phòng khách riêng và quyền vào Executive Lounge.'),
(2, 'Ocean Front Bungalow', 2500000, 2, 20, 'Bungalow sát biển với hiên tắm nắng riêng và view ngắm hoàng hôn.'),
(2, 'Family Beach Villa', 4800000, 4, 8, 'Biệt thự bãi biển 2 phòng ngủ cho gia đình kèm hồ bơi nhỏ.'),
(3, 'Premier River View', 1650000, 2, 25, 'Phòng tiêu chuẩn view sông Hàn và cầu Rồng lung linh về đêm.'),
(4, 'Grand Ocean Suite', 2800000, 2, 12, 'Suite hướng biển Nha Trang với bồn tắm nằm view biển.');

-- 4.3 Người dùng mẫu (Mật khẩu mặc định: 'Password@123' dạng sha256/hash)
INSERT INTO users (user_uuid, name, email, password_hash, phone, role) VALUES
('usr_admin_001', 'Hệ Thống Quản Trị', 'admin@hotelbooking.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '0909999999', 'ADMIN'),
('usr_guest_002', 'Nguyễn Văn An', 'nguyenvanan@gmail.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', '0901234567', 'USER');

-- 4.4 Đơn đặt phòng mẫu
INSERT INTO bookings (booking_id, hotel_id, room_id, user_id, hotel_name, guest_name, guest_phone, guest_email, check_in, check_out, room_type, total_price, status) VALUES
('HB-821934', 1, 1, 2, 'Grand Vista Hotel', 'Nguyễn Văn An', '0901234567', 'nguyenvanan@gmail.com', '2026-11-10', '2026-11-12', 'Deluxe King City View', 3700000, 'CONFIRMED'),
('HB-731209', 2, 3, 2, 'Sunrise Resort Phú Quốc', 'Nguyễn Văn An', '0901234567', 'nguyenvanan@gmail.com', '2026-12-01', '2026-12-04', 'Ocean Front Bungalow', 7500000, 'CONFIRMED');
