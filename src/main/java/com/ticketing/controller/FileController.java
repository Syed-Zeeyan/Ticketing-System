package com.ticketing.controller;

import com.ticketing.entity.User;
import com.ticketing.repository.UserRepository;
import com.ticketing.service.FileUploadService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.io.InputStream;
import java.time.Duration;

@RestController
@RequestMapping("/api/files")
public class FileController {
    private final FileUploadService fileUploadService;
    private final UserRepository userRepository;

    public FileController(FileUploadService fileUploadService, UserRepository userRepository) {
        this.fileUploadService = fileUploadService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{attachmentId}")
    public ResponseEntity<InputStreamResource> getFile(
            @PathVariable Long attachmentId,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            InputStream fileStream = fileUploadService.getFileStream(attachmentId, currentUser);
            String filename = fileUploadService.getOriginalFilename(attachmentId);

            if (filename == null || fileStream == null) {
                return ResponseEntity.notFound().build();
            }

            String contentType = determineContentType(filename);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + filename + "\"")
                    .body(new InputStreamResource(fileStream));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{attachmentId}/presigned")
    public ResponseEntity<String> getPresignedUrl(
            @PathVariable Long attachmentId,
            Authentication authentication) {
        try {
            User currentUser = getCurrentUser(authentication);
            InputStream fileStream = fileUploadService.getFileStream(attachmentId, currentUser);
            fileStream.close();
            
            String url = fileUploadService.getAttachmentUrl(attachmentId);
            String key = extractKeyFromUrl(url);
            
            String presignedUrl = fileUploadService.getPresignedUrl(key, Duration.ofHours(1));
            
            if (presignedUrl != null) {
                return ResponseEntity.ok(presignedUrl);
            } else {
                return ResponseEntity.ok("/api/files/" + attachmentId);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private User getCurrentUser(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String determineContentType(String filename) {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) {
            return "image/png";
        } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        } else if (lower.endsWith(".pdf")) {
            return "application/pdf";
        } else if (lower.endsWith(".txt")) {
            return "text/plain";
        }
        return "application/octet-stream";
    }

    private String extractKeyFromUrl(String url) {
        if (url.startsWith("/api/files/")) {
            return url.replace("/api/files/", "");
        }
        return url;
    }
}

