package com.ticketing.repository;

import com.ticketing.entity.TicketRating;
import com.ticketing.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketRatingRepository extends JpaRepository<TicketRating, Long> {
    Optional<TicketRating> findByTicket(Ticket ticket);
}

