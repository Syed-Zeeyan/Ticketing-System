package com.ticketing.service;

import com.ticketing.dto.RatingRequest;
import com.ticketing.entity.Status;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.TicketRating;
import com.ticketing.entity.User;
import com.ticketing.repository.TicketRatingRepository;
import com.ticketing.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class RatingService {
    private final TicketRatingRepository ratingRepository;
    private final TicketRepository ticketRepository;

    public RatingService(TicketRatingRepository ratingRepository, TicketRepository ticketRepository) {
        this.ratingRepository = ratingRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional
    public void rateTicket(Long ticketId, RatingRequest request, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (ticket.getStatus() != Status.RESOLVED && ticket.getStatus() != Status.CLOSED) {
            throw new RuntimeException("Ticket must be resolved or closed to rate");
        }

        if (!ticket.getOwner().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Only ticket owner can rate");
        }

        TicketRating rating = ratingRepository.findByTicket(ticket)
                .orElse(new TicketRating());

        rating.setTicket(ticket);
        rating.setRating(request.getRating());
        rating.setFeedback(request.getFeedback());

        ratingRepository.save(rating);

        ticket.setRating(request.getRating());
        if (ticket.getResolvedAt() == null) {
            ticket.setResolvedAt(LocalDateTime.now());
        }
        ticketRepository.save(ticket);
    }
}

