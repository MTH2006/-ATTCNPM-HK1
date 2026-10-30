package com.hotelbooking.controller;

import com.hotelbooking.model.Booking;
import com.hotelbooking.service.BookingService;
import com.hotelbooking.service.AuthSessionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;
    private final AuthSessionService sessions;

    public BookingController(BookingService bookingService, AuthSessionService sessions) {
        this.bookingService = bookingService;
        this.sessions = sessions;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createBooking(@RequestBody Booking booking) {
        Map<String, Object> response = new HashMap<>();
        try {
            Booking created = bookingService.createBooking(booking);
            response.put("success", true);
            response.put("booking", created);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Lỗi xử lý đặt phòng: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{bookingId}")
    public ResponseEntity<Booking> getBookingById(@PathVariable String bookingId) {
        Booking booking = bookingService.getBookingById(bookingId);
        if (booking == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelBooking(@PathVariable String bookingId) {
        boolean cancelled = bookingService.cancelBooking(bookingId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", cancelled);
        if (cancelled) {
            response.put("message", "Đã hủy đơn đặt phòng thành công.");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Không tìm thấy mã đặt phòng để hủy.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    @PutMapping("/{bookingId}/complete")
    public ResponseEntity<Map<String, Object>> completeBooking(@PathVariable String bookingId,
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (!sessions.isAdmin(authorization)) return ResponseEntity.status(403).body(Map.of("success", false, "message", "Chỉ quản trị viên mới có quyền hoàn tất đơn."));
        boolean completed = bookingService.completeBooking(bookingId);
        return completed ? ResponseEntity.ok(Map.of("success", true, "message", "Đơn lưu trú đã hoàn tất."))
                : ResponseEntity.badRequest().body(Map.of("success", false, "message", "Chỉ có thể hoàn tất đơn đã xác nhận sau ngày trả phòng."));
    }
}
