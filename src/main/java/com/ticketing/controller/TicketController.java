package com.ticketing.controller;

import com.ticketing.dto.*;
import com.ticketing.entity.User;
import com.ticketing.repository.UserRepository;
import com.ticketing.service.AttachmentService;
import com.ticketing.service.CommentService;
import com.ticketing.service.FileUploadService;
import com.ticketing.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    private final TicketService ticketService;
    private final CommentService commentService;
    private final FileUploadService fileUploadService;
    private final AttachmentService attachmentService;
    private final UserRepository userRepository;

    public TicketController(TicketService ticketService, CommentService commentService,
                           FileUploadService fileUploadService, AttachmentService attachmentService,
                           UserRepository userRepository) {
        this.ticketService = ticketService;
        this.commentService = commentService;
        this.fileUploadService = fileUploadService;
        this.attachmentService = attachmentService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<TicketResponse>> getAllTickets(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return ResponseEntity.ok(ticketService.getAllTickets(currentUser));
    }

    @PostMapping
    public ResponseEntity<TicketResponse> createTicket(@Valid @RequestBody TicketRequest request,
                                                       Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return ResponseEntity.ok(ticketService.createTicket(request, currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable Long id,
                                                       Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return ResponseEntity.ok(ticketService.getTicketById(id, currentUser));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentResponse>> getComments(@PathVariable Long id,
                                                             Authentication authentication) {
        getCurrentUser(authentication);
        return ResponseEntity.ok(commentService.getCommentsByTicket(id));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long id,
                                                      @Valid @RequestBody CommentRequest request,
                                                      Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return ResponseEntity.ok(commentService.createComment(id, request, currentUser));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<TicketResponse> assignTicket(@PathVariable Long id,
                                                       @Valid @RequestBody AssignTicketRequest request,
                                                       Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return ResponseEntity.ok(ticketService.assignTicket(id, request, currentUser));
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<TicketResponse> updateStatus(@PathVariable Long id,
                                                      @Valid @RequestBody UpdateStatusRequest request,
                                                      Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return ResponseEntity.ok(ticketService.updateStatus(id, request, currentUser));
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<AttachmentResponse>> getAttachments(@PathVariable Long id,
                                                                   Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        return ResponseEntity.ok(attachmentService.getAttachmentsByTicket(id, currentUser));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<AttachmentResponse> uploadAttachment(@PathVariable Long id,
                                                              @RequestParam("file") MultipartFile file,
                                                              Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        var attachment = fileUploadService.uploadFile(id, file, currentUser);
        AttachmentResponse response = new AttachmentResponse();
        response.setId(attachment.getId());
        response.setTicketId(attachment.getTicket().getId());
        response.setFilename(attachment.getFilename());
        response.setUrl("/api/files/" + attachment.getId());
        response.setUploadedById(attachment.getUploadedBy().getId());
        response.setUploadedByName(attachment.getUploadedBy().getFullName());
        response.setCreatedAt(attachment.getCreatedAt());
        return ResponseEntity.ok(response);
    }

    private User getCurrentUser(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

