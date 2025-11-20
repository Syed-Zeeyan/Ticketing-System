package com.ticketing.service;

import com.ticketing.dto.TicketResponse;
import com.ticketing.dto.TicketSearchRequest;
import com.ticketing.dto.TicketSearchResponse;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.repository.TicketRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TicketSearchService {
    private final TicketRepository ticketRepository;
    private final TicketService ticketService;

    public TicketSearchService(TicketRepository ticketRepository, TicketService ticketService) {
        this.ticketRepository = ticketRepository;
        this.ticketService = ticketService;
    }

    public TicketSearchResponse search(TicketSearchRequest request, User currentUser) {
        Specification<Ticket> spec = buildSpecification(request, currentUser);
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize());
        Page<Ticket> page = ticketRepository.findAll(spec, pageable);

        List<TicketResponse> content = page.getContent().stream()
            .map(ticket -> {
                try {
                    return ticketService.getTicketById(ticket.getId(), currentUser);
                } catch (Exception e) {
                    return null;
                }
            })
            .filter(t -> t != null)
            .collect(Collectors.toList());

        return new TicketSearchResponse(content, request.getPage(), request.getSize(), page.getTotalElements());
    }

    private Specification<Ticket> buildSpecification(TicketSearchRequest request, User currentUser) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (currentUser.getRole() != com.ticketing.entity.Role.ADMIN &&
                currentUser.getRole() != com.ticketing.entity.Role.AGENT) {
                predicates.add(cb.equal(root.get("owner").get("id"), currentUser.getId()));
            }

            if (request.getQ() != null && !request.getQ().trim().isEmpty()) {
                String searchTerm = "%" + request.getQ().toLowerCase() + "%";
                Predicate titlePred = cb.like(cb.lower(root.get("title")), searchTerm);
                Predicate descPred = cb.like(cb.lower(root.get("description")), searchTerm);
                predicates.add(cb.or(titlePred, descPred));
            }

            if (request.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), request.getStatus()));
            }

            if (request.getPriority() != null) {
                predicates.add(cb.equal(root.get("priority"), request.getPriority()));
            }

            if (request.getAssignee() != null) {
                predicates.add(cb.equal(root.get("assignee").get("id"), request.getAssignee()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

