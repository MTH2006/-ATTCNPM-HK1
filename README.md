# HotelBooking - Website Đặt Phòng Khách Sạn

Đồ án Công nghệ phần mềm: Hệ thống website đặt phòng khách sạn cao cấp (Full-stack).

---

## 🌟 Giao diện Trang Chủ (Home Page)
Giao diện được thiết kế theo phong cách Luxury Dark Theme sang trọng, hiện đại:
- **Header:** Logo thương hiệu, Menu điều hướng, Tìm kiếm nhanh, nút Đăng nhập & Đăng ký.
- **Hero Section:** Ảnh nền phòng khách sạn 5 sao cao cấp, tiêu đề *"Đặt phòng khách sạn dễ dàng, nhanh chóng"*.
- **Thanh tìm kiếm nổi (Floating Search Widget):**
  - Địa điểm: Gợi ý điểm đến phổ biến (TP.HCM, Hà Nội, Đà Nẵng, Phú Quốc, Nha Trang, Đà Lạt).
  - Ngày nhận phòng & Ngày trả phòng (tự động tính số đêm).
  - Chọn số khách: Popover tăng/giảm người lớn và trẻ em.
  - Nút "Tìm kiếm" với hiệu ứng lọc khách sạn theo thời gian thực.
- **4 Dịch vụ nổi bật (Value Propositions):**
  - Thanh toán an toàn
  - Hỗ trợ 24/7
  - Giá tốt nhất
  - Đa dạng lựa chọn
- **Khách sạn nổi bật (Featured Hotels):**
  - **Grand Vista Hotel** - Quận 1, TP. Hồ Chí Minh (1.850.000đ / đêm)
  - **Sunrise Resort Phú Quốc** - Phú Quốc, Kiên Giang (2.500.000đ / đêm, giảm giá 20%)
  - **The Lumiere Hotel** - Đà Nẵng (1.650.000đ / đêm)
  - **Melia Vinpearl Nha Trang** - Nha Trang, Khánh Hòa (2.800.000đ / đêm)
  - Tương tác: Lưu yêu thích (Wishlist heart), Nút "Đặt phòng ngay" mở Modal đặt phòng & tính giá tức thì.
- **Banner Kêu Gọi Hành Động (CTA Banner):**
  - *"Đặt phòng ngay hôm nay"*, Nút *"Khám phá ngay"*.
  - Chữ ký nghệ thuật: *"Better Stay Bigger Memories"*.
- **Footer:** Logo, liên kết nhanh, mạng xã hội (Facebook, Instagram, YouTube, Email) và bản quyền 2025.
- **Các tính năng tương tác bổ sung:**
  - Modal Đặt phòng chi tiết (chọn hạng phòng, thông tin liên hệ, tổng tiền).
  - Modal Đăng nhập / Đăng ký tài khoản.
  - Hệ thống thông báo Toast (Toast Notification) thời gian thực.
  - Responsive hoàn chỉnh cho Mobile & Tablet.

---

## 🚀 Hướng Dẫn Khởi Chạy

### 1. Khởi chạy Frontend
Bạn có 2 cách cực kỳ nhanh chóng:
- **Cách 1 (Khuyên dùng):** Chạy script PowerShell:
  ```powershell
  .\start-frontend.ps1
  ```
  Hệ thống sẽ tự động bật máy chủ cục bộ tại `http://localhost:3000/` và mở ngay trên trình duyệt.
- **Cách 2:** Mở trực tiếp file `frontend/index.html` bằng bất kỳ trình duyệt nào (Chrome, Edge, Opera, Firefox).

### 2. Khởi chạy Backend (Spring Boot REST API)
Yêu cầu: Đã cài JDK 17+ và Maven.
```powershell
.\start-backend.ps1
# hoặc:
cd backend
mvn spring-boot:run
```
Backend API sẽ hoạt động tại: `http://localhost:8080/api`:
- `GET /api/hotels/featured`: Lấy danh sách khách sạn nổi bật
- `GET /api/hotels/search?q={keyword}`: Tìm kiếm khách sạn
- `POST /api/bookings`: Đặt phòng mới
- `POST /api/auth/login`: Đăng nhập
- `POST /api/auth/register`: Đăng ký tài khoản
