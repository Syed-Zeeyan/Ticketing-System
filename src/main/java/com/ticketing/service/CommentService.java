package com.ticketing.service;

import com.ticketing.dto.CommentRequest;
import com.ticketing.dto.CommentResponse;
import com.ticketing.entity.Comment;
import com.ticketing.entity.Ticket;
import com.ticketing.entity.User;
import com.ticketing.repository.CommentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final TicketService ticketService;

    public CommentService(CommentRepository commentRepository, TicketService ticketService) {
        this.commentRepository = commentRepository;
        this.ticketService = ticketService;
    }

    @Transactional
    public CommentResponse createComment(Long ticketId, CommentRequest request, User user) {
        Ticket ticket = ticketService.findById(ticketId);

        Comment comment = new Comment();
        comment.setTicket(ticket);
        comment.setUser(user);
        comment.setContent(request.getContent());

        comment = commentRepository.save(comment);
        return toResponse(comment);
    }

    public List<CommentResponse> getCommentsByTicket(Long ticketId) {
        Ticket ticket = ticketService.findById(ticketId);
        return commentRepository.findByTicketOrderByCreatedAtAsc(ticket).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private CommentResponse toResponse(Comment comment) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setTicketId(comment.getTicket().getId());
        response.setUserId(comment.getUser().getId());
        response.setUserName(comment.getUser().getFullName());
        response.setContent(comment.getContent());
        response.setCreatedAt(comment.getCreatedAt());
        return response;
    }
}

