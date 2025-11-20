package com.ticketing.service;

import com.ticketing.dto.AdminStatsResponse;
import com.ticketing.entity.Status;
import com.ticketing.entity.Ticket;
import com.ticketing.repository.TicketRepository;
import com.ticketing.repository.TicketRatingRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminStatsService {
    private final TicketRepository ticketRepository;
    private final TicketRatingRepository ratingRepository;

    public AdminStatsService(TicketRepository ticketRepository, TicketRatingRepository ratingRepository) {
        this.ticketRepository = ticketRepository;
        this.ratingRepository = ratingRepository;
    }

    public AdminStatsResponse getStats() {
        List<Ticket> allTickets = ticketRepository.findAll();

        long openCount = allTickets.stream()
            .filter(t -> t.getStatus() == Status.OPEN || t.getStatus() == Status.IN_PROGRESS)
            .count();

        List<Ticket> resolvedTickets = allTickets.stream()
            .filter(t -> t.getResolvedAt() != null)
            .toList();

        BigDecimal avgResolutionTime = BigDecimal.ZERO;
        if (!resolvedTickets.isEmpty()) {
            double totalHours = resolvedTickets.stream()
                .mapToDouble(t -> {
                    Duration duration = Duration.between(t.getCreatedAt(), t.getResolvedAt());
                    return duration.toHours();
                })
                .sum();
            avgResolutionTime = BigDecimal.valueOf(totalHours / resolvedTickets.size())
                .setScale(2, RoundingMode.HALF_UP);
        }

        long slaBreaches = allTickets.stream()
            .filter(t -> t.getSlaDueAt() != null && t.getStatus() != Status.CLOSED)
            .filter(t -> LocalDateTime.now().isAfter(t.getSlaDueAt()))
            .count();

        BigDecimal avgRating = BigDecimal.ZERO;
        long ratedCount = ratingRepository.count();
        if (ratedCount > 0) {
            double totalRating = ratingRepository.findAll().stream()
                .mapToInt(r -> r.getRating())
                .sum();
            avgRating = BigDecimal.valueOf(totalRating / (double) ratedCount)
                .setScale(2, RoundingMode.HALF_UP);
        }

        return new AdminStatsResponse(openCount, avgResolutionTime, slaBreaches, avgRating);
    }
}

