package com.hotelbooking.service;

import com.hotelbooking.model.Booking;
import com.hotelbooking.model.Hotel;
import com.hotelbooking.model.Room;
import com.hotelbooking.repository.BookingRepository;
import com.hotelbooking.repository.HotelRepository;
import com.hotelbooking.repository.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);
    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final Random random = new Random();

    public BookingService(BookingRepository bookingRepository, HotelRepository hotelRepository, RoomRepository roomRepository) {
        this.bookingRepository = bookingRepository;
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Booking createBooking(Booking booking) {
        // 1. Kiểm tra ngày nhận & trả phòng
        if (booking.getCheckIn() == null || booking.getCheckOut() == null) {
            throw new IllegalArgumentException("Ngày nhận phòng và ngày trả phòng không được để trống.");
        }
        if (!booking.getCheckOut().isAfter(booking.getCheckIn())) {
            throw new IllegalArgumentException("Ngày trả phòng phải sau ngày nhận phòng.");
        }

        // 2. Xác thực khách sạn tồn tại
        if (booking.getHotelId() != null) {
            Optional<Hotel> hotelOpt = hotelRepository.findById(booking.getHotelId());
            if (hotelOpt.isPresent()) {
                booking.setHotelName(hotelOpt.get().getName());
            }
        }

        // 3. Kiểm tra chống đặt phòng trùng lịch (Double Booking Prevention)
        long overlappingCount = bookingRepository.countOverlappingBookings(
                booking.getHotelId(),
                booking.getRoomType(),
                booking.getCheckIn(),
                booking.getCheckOut()
        );

        int maxAvailableRooms = 10; // Giới hạn mặc định nếu không cấu hình phòng chi tiết
        Optional<Room> roomOpt = roomRepository.findByHotelIdAndRoomType(booking.getHotelId(), booking.getRoomType());
        if (roomOpt.isPresent()) {
            booking.setRoomId(roomOpt.get().getId());
            maxAvailableRooms = roomOpt.get().getTotalRooms();
        }

        if (overlappingCount >= maxAvailableRooms) {
            throw new IllegalStateException("Hạng phòng '" + booking.getRoomType() + "' đã hết phòng trống trong khoảng thời gian đã chọn.");
        }

        // 4. Sinh mã đặt phòng duy nhất
        String bookingId = "HB-" + (100000 + random.nextInt(900000));
        while (bookingRepository.findByBookingId(bookingId).isPresent()) {
            bookingId = "HB-" + (100000 + random.nextInt(900000));
        }
        booking.setBookingId(bookingId);
        booking.setStatus("CONFIRMED");

        // 5. Lưu vào PostgreSQL
        Booking saved = bookingRepository.save(booking);
        log.info("Booking created successfully: ID={}, Code={}", saved.getId(), saved.getBookingId());
        return saved;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    public Booking getBookingById(String bookingId) {
        return bookingRepository.findByBookingId(bookingId).orElse(null);
    }

    @Transactional
    public boolean cancelBooking(String bookingId) {
        Optional<Booking> opt = bookingRepository.findByBookingId(bookingId);
        if (opt.isPresent()) {
            Booking b = opt.get();
            b.setStatus("CANCELLED");
            bookingRepository.save(b);
            return true;
        }
        return false;
    }
}
