package com.ticketing.controller;

import com.ticketing.dto.RatingRequest;
import com.ticketing.entity.User;
import com.ticketing.repository.UserRepository;
import com.ticketing.service.RatingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
public class RatingController {
    private final RatingService ratingService;
    private final UserRepository userRepository;

    public RatingController(RatingService ratingService, UserRepository userRepository) {
        this.ratingService = ratingService;
        this.userRepository = userRepository;
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<Void> rateTicket(
            @PathVariable Long id,
            @Valid @RequestBody RatingRequest request,
            Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        ratingService.rateTicket(id, request, currentUser);
        return ResponseEntity.ok().build();
    }

    private User getCurrentUser(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

