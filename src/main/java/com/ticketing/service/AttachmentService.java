package com.ticketing.service;

import com.ticketing.dto.AttachmentResponse;
import com.ticketing.entity.Attachment;
import com.ticketing.entity.Role;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.repository.AttachmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttachmentService {
    private final AttachmentRepository attachmentRepository;
    private final TicketService ticketService;

    public AttachmentService(AttachmentRepository attachmentRepository, TicketService ticketService) {
        this.attachmentRepository = attachmentRepository;
        this.ticketService = ticketService;
    }

    public List<AttachmentResponse> getAttachmentsByTicket(Long ticketId, User currentUser) {
        Ticket ticket = ticketService.findById(ticketId);

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.AGENT) {
            if (!ticket.getOwner().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Access denied");
            }
        }

        List<Attachment> attachments = attachmentRepository.findByTicket(ticket);
        return attachments.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private AttachmentResponse toResponse(Attachment attachment) {
        AttachmentResponse response = new AttachmentResponse();
        response.setId(attachment.getId());
        response.setTicketId(attachment.getTicket().getId());
        response.setFilename(attachment.getFilename());
        response.setUrl("/api/files/" + attachment.getId());
        response.setUploadedById(attachment.getUploadedBy().getId());
        response.setUploadedByName(attachment.getUploadedBy().getFullName());
        response.setCreatedAt(attachment.getCreatedAt());
        return response;
    }
}

