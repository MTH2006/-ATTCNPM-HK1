const express = require('express');
const router = express.Router();
router.get('/promotions', async (req, res) => {
    res.json({ status: 'success', data: [] });
});

router.get('/promotions/:id', async (req, res) => {
    res.json({ status: 'success', data: {} });
});

router.post('/promotions/apply', async (req, res) => {
    const { code } = req.body;
    res.json({ message: 'Áp dụng mã khuyến mãi thành công!' });
});

router.post('/admin/promotions', async (req, res) => {
    res.json({ message: 'Cập nhật chương trình khuyến mãi thành công!' });
});

module.exports = router;
