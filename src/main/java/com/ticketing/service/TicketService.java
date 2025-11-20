package com.ticketing.service;

import com.ticketing.dto.AssignTicketRequest;
import com.ticketing.dto.TicketRequest;
import com.ticketing.dto.TicketResponse;
import com.ticketing.dto.UpdateStatusRequest;
import com.ticketing.entity.Role;
import com.ticketing.entity.Status;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final UserService userService;

    public TicketService(TicketRepository ticketRepository, UserService userService) {
        this.ticketRepository = ticketRepository;
        this.userService = userService;
    }

    public List<TicketResponse> getAllTickets(User currentUser) {
        List<Ticket> tickets;
        if (currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.AGENT) {
            tickets = ticketRepository.findAll();
        } else {
            tickets = ticketRepository.findByOwner(currentUser);
        }
        return tickets.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public TicketResponse createTicket(TicketRequest request, User owner) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(request.getPriority());
        ticket.setStatus(Status.OPEN);
        ticket.setOwner(owner);
        ticket.setUrgencyScore(calculateUrgencyScore(request.getPriority()));

        LocalDateTime slaDueAt = calculateSlaDueAt(request.getPriority());
        ticket.setSlaDueAt(slaDueAt);

        ticket = ticketRepository.save(ticket);
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse createTicketWithTriage(TicketRequest request, User owner, com.ticketing.dto.TriagePredictionResponse triage) {
        Ticket ticket = new Ticket();
        ticket.setTitle(request.getTitle());
        ticket.setDescription(request.getDescription());
        ticket.setPriority(triage.getSuggestedPriority());
        ticket.setStatus(Status.OPEN);
        ticket.setOwner(owner);
        ticket.setUrgencyScore(triage.getUrgencyScore().intValue());

        if (triage.getSuggestedAssigneeId() != null) {
            User assignee = userService.findById(triage.getSuggestedAssigneeId());
            ticket.setAssignee(assignee);
        }

        LocalDateTime slaDueAt = calculateSlaDueAt(triage.getSuggestedPriority());
        ticket.setSlaDueAt(slaDueAt);

        ticket = ticketRepository.save(ticket);
        return toResponse(ticket);
    }

    public TicketResponse getTicketById(Long id, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.AGENT) {
            if (!ticket.getOwner().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Access denied");
            }
        }

        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse assignTicket(Long id, AssignTicketRequest request, User currentUser) {
        if (currentUser.getRole() != Role.ADMIN && currentUser.getRole() != Role.AGENT) {
            throw new RuntimeException("Access denied");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User assignee = userService.findById(request.getAssigneeId());
        ticket.setAssignee(assignee);

        ticket = ticketRepository.save(ticket);
        return toResponse(ticket);
    }

    @Transactional
    public TicketResponse updateStatus(Long id, UpdateStatusRequest request, User currentUser) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        boolean isAdminOrAgent = currentUser.getRole() == Role.ADMIN || currentUser.getRole() == Role.AGENT;
        boolean isOwner = ticket.getOwner().getId().equals(currentUser.getId());

        if (!isAdminOrAgent && !isOwner) {
            throw new RuntimeException("Access denied");
        }

        if (!isAdminOrAgent && isOwner) {
            if (request.getStatus() != Status.RESOLVED && request.getStatus() != Status.CLOSED) {
                throw new RuntimeException("Users can only close or resolve their own tickets");
            }
        }

        ticket.setStatus(request.getStatus());
        
        if ((request.getStatus() == Status.RESOLVED || request.getStatus() == Status.CLOSED) 
            && ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        ticket = ticketRepository.save(ticket);
        return toResponse(ticket);
    }

    public Ticket findById(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
    }

    private TicketResponse toResponse(Ticket ticket) {
        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setTitle(ticket.getTitle());
        response.setDescription(ticket.getDescription());
        response.setPriority(ticket.getPriority());
        response.setStatus(ticket.getStatus());
        response.setOwnerId(ticket.getOwner().getId());
        response.setOwnerName(ticket.getOwner().getFullName());
        if (ticket.getAssignee() != null) {
            response.setAssigneeId(ticket.getAssignee().getId());
            response.setAssigneeName(ticket.getAssignee().getFullName());
        }
        response.setCreatedAt(ticket.getCreatedAt());
        response.setUpdatedAt(ticket.getUpdatedAt());
        response.setSlaDueAt(ticket.getSlaDueAt());
        response.setUrgencyScore(ticket.getUrgencyScore());
        return response;
    }

    private Integer calculateUrgencyScore(com.ticketing.entity.Priority priority) {
        return switch (priority) {
            case LOW -> 1;
            case MEDIUM -> 2;
            case HIGH -> 3;
            case CRITICAL -> 4;
        };
    }

    private LocalDateTime calculateSlaDueAt(com.ticketing.entity.Priority priority) {
        int hours = switch (priority) {
            case LOW -> 72;
            case MEDIUM -> 24;
            case HIGH -> 8;
            case CRITICAL -> 2;
        };
        return LocalDateTime.now().plusHours(hours);
    }
}

