package com.ticketing.controller;

import com.ticketing.dto.TicketSearchRequest;
import com.ticketing.dto.TicketSearchResponse;
import com.ticketing.entity.User;
import com.ticketing.repository.UserRepository;
import com.ticketing.service.TicketSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
public class TicketSearchController {
    private final TicketSearchService searchService;
    private final UserRepository userRepository;

    public TicketSearchController(TicketSearchService searchService, UserRepository userRepository) {
        this.searchService = searchService;
        this.userRepository = userRepository;
    }

    @GetMapping("/search")
    public ResponseEntity<TicketSearchResponse> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long assignee,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            Authentication authentication) {
        TicketSearchRequest request = new TicketSearchRequest();
        request.setQ(q);
        if (status != null) {
            request.setStatus(com.ticketing.entity.Status.valueOf(status));
        }
        if (priority != null) {
            request.setPriority(com.ticketing.entity.Priority.valueOf(priority));
        }
        request.setAssignee(assignee);
        request.setPage(page);
        request.setSize(size);

        User currentUser = getCurrentUser(authentication);
        return ResponseEntity.ok(searchService.search(request, currentUser));
    }

    private User getCurrentUser(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

