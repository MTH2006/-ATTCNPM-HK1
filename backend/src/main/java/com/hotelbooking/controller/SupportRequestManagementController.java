
package com.hotelbooking.controller;

import com.hotelbooking.model.SupportRequest;
import com.hotelbooking.model.User;
import com.hotelbooking.security.AccessControlService;
import com.hotelbooking.service.SupportRequestService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/support/requests")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173"
})
public class SupportRequestManagementController {

    private final SupportRequestService supportRequestService;
    private final AccessControlService accessControl;

    public SupportRequestManagementController(
            SupportRequestService supportRequestService,
            AccessControlService accessControl) {

        this.supportRequestService = supportRequestService;
        this.accessControl = accessControl;
    }

    // FR-95: Nhan vien xem danh sach yeu cau ho tro
    @GetMapping
    public ResponseEntity<List<SupportRequest>> getAllSupportRequests(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorization) {

        // Kiem tra JWT dang nhap
        Optional<User> currentUser =
                accessControl.authenticate(authorization);

        // Chua dang nhap hoac token khong hop le
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        // Chi ADMIN hoac MANAGER duoc xem yeu cau
        if (!accessControl.isManagerOrAdmin(currentUser.get())) {
            return ResponseEntity.status(403).build();
        }

        // Lay danh sach yeu cau tu PostgreSQL
        List<SupportRequest> requests =
                supportRequestService.getAllSupportRequests();

        return ResponseEntity.ok(requests);
    }
    
    // FR-95: ADMIN hoac MANAGER tiep nhan yeu cau ho tro
    @PutMapping("/{requestId}/accept")
    public ResponseEntity<?> acceptSupportRequest(
            @PathVariable Long requestId,
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorization) {

        // Kiem tra token JWT
        Optional<User> currentUser =
                accessControl.authenticate(authorization);

        // Chua dang nhap hoac token khong hop le
        if (currentUser.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        // Chi ADMIN hoac MANAGER duoc tiep nhan yeu cau
        if (!accessControl.isManagerOrAdmin(currentUser.get())) {
            return ResponseEntity.status(403).build();
        }

        try {
            // Goi Service cap nhat trang thai trong PostgreSQL
            SupportRequest updated =
                    supportRequestService.acceptSupportRequest(requestId);

            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "message", "Tiep nhan yeu cau ho tro thanh cong.",
                    "requestId", updated.getId(),
                    "status", updated.getStatus()
            ));

        } catch (IllegalArgumentException e) {

            // Ma yeu cau sai hoac khong tim thay
            return ResponseEntity.badRequest().body(
                    java.util.Map.of(
                            "success", false,
                            "message", e.getMessage()
                    )
            );

        } catch (IllegalStateException e) {

            // Yeu cau da duoc tiep nhan truoc do
            return ResponseEntity.status(409).body(
                    java.util.Map.of(
                            "success", false,
                            "message", e.getMessage()
                    )
            );
        }
    }
}
