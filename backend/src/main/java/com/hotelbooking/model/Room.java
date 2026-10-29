package com.hotelbooking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;

    @Column(name = "room_type", nullable = false)
    private String roomType;

    @Column(name = "price_per_night", nullable = false)
    private Long pricePerNight;

    @Column(nullable = false)
    private Integer capacity = 2;

    @Column(name = "total_rooms", nullable = false)
    private Integer totalRooms = 10;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Room() {}

    public Room(Long id, Long hotelId, String roomType, Long pricePerNight, Integer capacity, Integer totalRooms, String description) {
        this.id = id;
        this.hotelId = hotelId;
        this.roomType = roomType;
        this.pricePerNight = pricePerNight;
        this.capacity = capacity;
        this.totalRooms = totalRooms;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHotelId() { return hotelId; }
    public void setHotelId(Long hotelId) { this.hotelId = hotelId; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public Long getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(Long pricePerNight) { this.pricePerNight = pricePerNight; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Integer getTotalRooms() { return totalRooms; }
    public void setTotalRooms(Integer totalRooms) { this.totalRooms = totalRooms; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
