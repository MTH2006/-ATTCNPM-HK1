package com.hotelbooking.repository;

import com.hotelbooking.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingId(String bookingId);

    List<Booking> findByGuestEmailOrderByCreatedAtDesc(String guestEmail);

    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(b) FROM Booking b WHERE " +
           "b.hotelId = :hotelId AND " +
           "b.roomType = :roomType AND " +
           "b.status <> 'CANCELLED' AND " +
           "b.checkIn < :checkOut AND " +
           "b.checkOut > :checkIn")
    long countOverlappingBookings(
            @Param("hotelId") Long hotelId,
            @Param("roomType") String roomType,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );
}
