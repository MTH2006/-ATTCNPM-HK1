const express = require('express');
const router = express.Router();

// [FR-71] Xem danh sách đơn đặt phòng thuộc phạm vi quản lý của nhân viên
router.get('/staff/bookings', async (req, res) => {
    res.json({ status: 'success', data: [] });
});

// [FR-72] Tìm kiếm đơn đặt phòng theo mã đơn, khách hàng, khách sạn hoặc thời gian
router.get('/staff/bookings/search', async (req, res) => {
    const { keyword, hotelId, date } = req.query;
    res.json({ status: 'success', data: [] });
});

// [FR-73] Xác nhận đơn đặt phòng theo quy trình nghiệp vụ
router.patch('/staff/bookings/:id/confirm', async (req, res) => {
    res.json({ message: 'Đã xác nhận đơn đặt phòng thành công!' });
});

// [FR-74] Từ chối yêu cầu đặt phòng (ghi nhận lý do)
router.patch('/staff/bookings/:id/reject', async (req, res) => {
    const { reason } = req.body;
    // Logic từ chối và lưu lý do
    res.json({ message: 'Đã từ chối đơn đặt phòng.', reason });
});

// [FR-75] Cập nhật trạng thái đơn theo tiến trình xử lý thực tế
router.patch('/staff/bookings/:id/status', async (req, res) => {
    const { status } = req.body;
    res.json({ message: 'Cập nhật trạng thái thành công!' });
});

// [FR-76] Xử lý yêu cầu hủy phòng theo chính sách
router.post('/staff/bookings/:id/cancel', async (req, res) => {
    res.json({ message: 'Đã xử lý yêu cầu hủy phòng!' });
});

// [FR-77] Quản lý nhận phòng (Ghi nhận khách check-in)
router.patch('/staff/bookings/:id/check-in', async (req, res) => {
    res.json({ message: 'Check-in thành công!' });
});

// [FR-78] Quản lý trả phòng (Ghi nhận khách check-out)
router.patch('/staff/bookings/:id/check-out', async (req, res) => {
    res.json({ message: 'Check-out thành công!' });
});
module.exports = router;
