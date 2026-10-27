package com.hotelbooking.repository;

import com.hotelbooking.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    @Query("SELECT h FROM Hotel h WHERE " +
           "LOWER(h.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(h.location) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<Hotel> searchHotels(@Param("q") String query);

    List<Hotel> findByCityIgnoreCase(String city);
}
