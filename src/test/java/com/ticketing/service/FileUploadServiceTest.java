package com.ticketing.service;

import com.ticketing.entity.Attachment;
import com.ticketing.entity.Role;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.repository.AttachmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileUploadServiceTest {
    @Mock
    private AttachmentRepository attachmentRepository;

    @Mock
    private TicketService ticketService;

    @TempDir
    Path tempDir;

    private FileUploadService fileUploadService;
    private Ticket testTicket;
    private User testUser;

    @BeforeEach
    void setUp() {
        fileUploadService = new FileUploadService(
            attachmentRepository,
            ticketService,
            tempDir.toString(),
            "",
            false
        );

        testTicket = new Ticket();
        testTicket.setId(1L);

        testUser = new User();
        testUser.setId(1L);
        testUser.setRole(Role.USER);

        when(ticketService.findById(1L)).thenReturn(testTicket);
        when(attachmentRepository.save(any(Attachment.class))).thenAnswer(invocation -> {
            Attachment att = invocation.getArgument(0);
            att.setId(1L);
            return att;
        });
    }

    @Test
    void testUploadValidPngFile() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.png",
            "image/png",
            new byte[1024]
        );

        Attachment result = fileUploadService.uploadFile(1L, file, testUser);

        assertNotNull(result);
        assertEquals("test.png", result.getFilename());
        verify(attachmentRepository, times(1)).save(any(Attachment.class));
    }

    @Test
    void testUploadValidPdfFile() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "document.pdf",
            "application/pdf",
            new byte[2048]
        );

        Attachment result = fileUploadService.uploadFile(1L, file, testUser);

        assertNotNull(result);
        assertEquals("document.pdf", result.getFilename());
    }

    @Test
    void testUploadFileExceedsSizeLimit() {
        byte[] largeFile = new byte[11 * 1024 * 1024];
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "large.pdf",
            "application/pdf",
            largeFile
        );

        assertThrows(RuntimeException.class, () -> {
            fileUploadService.uploadFile(1L, file, testUser);
        });
    }

    @Test
    void testUploadInvalidFileType() {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "script.exe",
            "application/x-msdownload",
            new byte[1024]
        );

        assertThrows(RuntimeException.class, () -> {
            fileUploadService.uploadFile(1L, file, testUser);
        });
    }

    @Test
    void testUploadFileWithPathTraversal() {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "../../../etc/passwd",
            "text/plain",
            new byte[1024]
        );

        assertThrows(RuntimeException.class, () -> {
            fileUploadService.uploadFile(1L, file, testUser);
        });
    }

    @Test
    void testUploadFileWithSpecialCharacters() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "file<script>.png",
            "image/png",
            new byte[1024]
        );

        Attachment result = fileUploadService.uploadFile(1L, file, testUser);

        assertNotNull(result);
        assertFalse(result.getFilename().contains("<"));
        assertFalse(result.getFilename().contains(">"));
    }

    @Test
    void testGetFileStreamWithOwnerAccess() throws IOException {
        Attachment attachment = new Attachment();
        attachment.setId(1L);
        attachment.setTicket(testTicket);
        attachment.setFilename("test.pdf");
        attachment.setUrl("/api/files/test.pdf");
        testTicket.setOwner(testUser);

        when(attachmentRepository.findById(1L)).thenReturn(Optional.of(attachment));

        InputStream stream = fileUploadService.getFileStream(1L, testUser);

        assertNotNull(stream);
        stream.close();
    }

    @Test
    void testGetFileStreamWithAdminAccess() throws IOException {
        User admin = new User();
        admin.setId(2L);
        admin.setRole(Role.ADMIN);

        Attachment attachment = new Attachment();
        attachment.setId(1L);
        attachment.setTicket(testTicket);
        attachment.setFilename("test.pdf");
        attachment.setUrl("/api/files/test.pdf");

        when(attachmentRepository.findById(1L)).thenReturn(Optional.of(attachment));

        InputStream stream = fileUploadService.getFileStream(1L, admin);

        assertNotNull(stream);
        stream.close();
    }

    @Test
    void testGetFileStreamDeniedForUnauthorizedUser() {
        User otherUser = new User();
        otherUser.setId(3L);
        otherUser.setRole(Role.USER);

        User ticketOwner = new User();
        ticketOwner.setId(4L);

        Attachment attachment = new Attachment();
        attachment.setId(1L);
        attachment.setTicket(testTicket);
        testTicket.setOwner(ticketOwner);

        when(attachmentRepository.findById(1L)).thenReturn(Optional.of(attachment));

        assertThrows(RuntimeException.class, () -> {
            fileUploadService.getFileStream(1L, otherUser);
        });
    }
}

