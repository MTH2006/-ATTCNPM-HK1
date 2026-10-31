
package com.hotelbooking.service;

import com.hotelbooking.model.SupportRequest;
import com.hotelbooking.repository.SupportRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
public class SupportRequestService {

    private final SupportRequestRepository supportRequestRepository;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    public SupportRequestService(
            SupportRequestRepository supportRequestRepository) {
        this.supportRequestRepository = supportRequestRepository;
    }

    // FR-94: Tiep nhan yeu cau ho tro cua khach hang
    @Transactional
    public SupportRequest createSupportRequest(SupportRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Thong tin yeu cau ho tro khong hop le.");
        }

        String customerName =
                normalize(request.getCustomerName());

        String customerEmail =
                normalize(request.getCustomerEmail());

        String subject = normalize(request.getSubject());

        String message = normalize(request.getMessage());

        // Kiem tra ten khach hang
        if (customerName.isBlank() || customerName.length() > 150) {
            throw new IllegalArgumentException(
                    "Ten khach hang khong hop le.");
        }

        // Kiem tra email lien he
        if (customerEmail.length() > 255
                || !EMAIL_PATTERN.matcher(customerEmail).matches()) {
            throw new IllegalArgumentException(
                    "Email lien he khong hop le.");
        }

        // Kiem tra chu de
        if (subject.isBlank() || subject.length() > 200) {
            throw new IllegalArgumentException(
                    "Chu de ho tro khong hop le.");
        }

        // Kiem tra noi dung yeu cau
        if (message.isBlank() || message.length() > 5000) {
            throw new IllegalArgumentException(
                    "Noi dung ho tro khong hop le.");
        }

        request.setId(null);
        request.setCustomerName(customerName);
        request.setCustomerEmail(customerEmail);
        request.setSubject(subject);
        request.setMessage(message);

        // Trang thai va thoi gian do he thong quyet dinh
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());

        // Luu yeu cau vao PostgreSQL
        return supportRequestRepository.save(request);
    }

    // Loai bo khoang trang thua va xu ly gia tri null
    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
