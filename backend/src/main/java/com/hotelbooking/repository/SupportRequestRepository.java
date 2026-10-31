
package com.hotelbooking.repository;

import com.hotelbooking.model.SupportRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupportRequestRepository
        extends JpaRepository<SupportRequest, Long> {

    // FR-94: Luu yeu cau ho tro cua khach hang
    // FR-95: Truy xuat danh sach yeu cau ho tro
}
