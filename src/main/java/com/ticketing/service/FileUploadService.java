package com.ticketing.service;

import com.ticketing.entity.Attachment;
import com.ticketing.entity.Role;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.repository.AttachmentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".png", ".jpg", ".jpeg", ".pdf", ".txt");
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
        "image/png", "image/jpeg", "application/pdf", "text/plain"
    );

    private final AttachmentRepository attachmentRepository;
    private final TicketService ticketService;
    private final Path uploadDir;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final String s3Bucket;
    private final boolean useS3;

    public FileUploadService(
            AttachmentRepository attachmentRepository,
            TicketService ticketService,
            @Value("${file.upload-dir:./uploads}") String uploadDir,
            @Value("${aws.s3.bucket:}") String s3Bucket,
            @Value("${aws.s3.enabled:false}") boolean s3Enabled) {
        this.attachmentRepository = attachmentRepository;
        this.ticketService = ticketService;
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.useS3 = s3Enabled && s3Bucket != null && !s3Bucket.isEmpty();
        this.s3Bucket = s3Bucket;

        if (useS3) {
            this.s3Client = S3Client.builder().build();
            this.s3Presigner = S3Presigner.builder().build();
        } else {
            this.s3Client = null;
            this.s3Presigner = null;
            try {
                Files.createDirectories(this.uploadDir);
            } catch (IOException e) {
                throw new RuntimeException("Could not create upload directory", e);
            }
        }
    }

    @Transactional
    public Attachment uploadFile(Long ticketId, MultipartFile file, User user) {
        Ticket ticket = ticketService.findById(ticketId);

        validateFile(file);

        String originalFilename = sanitizeFilename(file.getOriginalFilename());
        String fileExtension = getFileExtension(originalFilename);
        validateFileExtension(fileExtension);

        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        String fileUrl;

        try {
            if (useS3) {
                fileUrl = uploadToS3(uniqueFilename, file);
            } else {
                fileUrl = uploadToLocal(uniqueFilename, file);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file", e);
        }

        Attachment attachment = new Attachment();
        attachment.setTicket(ticket);
        attachment.setFilename(originalFilename);
        attachment.setUrl(fileUrl);
        attachment.setUploadedBy(user);

        return attachmentRepository.save(attachment);
    }

    public InputStream getFileStream(Long attachmentId, User currentUser) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        Ticket ticket = attachment.getTicket();
        if (!hasAccess(ticket, currentUser)) {
            throw new RuntimeException("Access denied");
        }

        try {
            if (useS3) {
                return getFileFromS3(attachment.getUrl());
            } else {
                return getFileFromLocal(attachment.getUrl());
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }
    }

    public String getOriginalFilename(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        return attachment.getFilename();
    }

    public String getAttachmentUrl(Long attachmentId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        return attachment.getUrl();
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new RuntimeException("File size exceeds 10MB limit");
        }

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("File type not allowed. Allowed types: PNG, JPG, PDF, TXT");
        }
    }

    private void validateFileExtension(String extension) {
        if (extension == null || extension.isEmpty()) {
            throw new RuntimeException("File must have an extension");
        }

        String lowerExt = extension.toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(lowerExt)) {
            throw new RuntimeException("File extension not allowed. Allowed: " + ALLOWED_EXTENSIONS);
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null || filename.isEmpty()) {
            throw new RuntimeException("Filename is required");
        }

        String sanitized = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        
        if (sanitized.contains("..") || sanitized.contains("/") || sanitized.contains("\\")) {
            throw new RuntimeException("Invalid filename: path traversal detected");
        }

        return sanitized;
    }

    private String uploadToLocal(String uniqueFilename, MultipartFile file) throws IOException {
        Path targetPath = uploadDir.resolve(uniqueFilename);
        
        if (!targetPath.normalize().startsWith(uploadDir)) {
            throw new RuntimeException("Path traversal detected");
        }

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        return "/api/files/" + uniqueFilename;
    }

    private String uploadToS3(String uniqueFilename, MultipartFile file) throws IOException {
        try {
            PutObjectRequest putRequest = PutObjectRequest.builder()
                    .bucket(s3Bucket)
                    .key(uniqueFilename)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            return uniqueFilename;
        } catch (Exception e) {
            throw new IOException("Failed to upload to S3", e);
        }
    }

    private InputStream getFileFromLocal(String url) throws IOException {
        String filename = url.replace("/api/files/", "");
        Path filePath = uploadDir.resolve(filename).normalize();
        
        if (!filePath.startsWith(uploadDir)) {
            throw new RuntimeException("Path traversal detected");
        }

        return Files.newInputStream(filePath);
    }

    private InputStream getFileFromS3(String key) {
        GetObjectRequest getRequest = GetObjectRequest.builder()
                .bucket(s3Bucket)
                .key(key)
                .build();
        return s3Client.getObject(getRequest);
    }

    public String getPresignedUrl(String key, Duration expiration) {
        if (!useS3) {
            return null;
        }

        GetObjectRequest getRequest = GetObjectRequest.builder()
                .bucket(s3Bucket)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(expiration)
                .getObjectRequest(getRequest)
                .build();

        PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
        return presignedRequest.url().toString();
    }

    private boolean hasAccess(Ticket ticket, User user) {
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.AGENT) {
            return true;
        }
        return ticket.getOwner().getId().equals(user.getId()) ||
               (ticket.getAssignee() != null && ticket.getAssignee().getId().equals(user.getId()));
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        return lastDot > 0 ? filename.substring(lastDot).toLowerCase() : "";
    }
}

