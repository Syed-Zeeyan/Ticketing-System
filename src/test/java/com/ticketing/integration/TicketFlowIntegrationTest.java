package com.ticketing.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.dto.*;
import com.ticketing.entity.Priority;
import com.ticketing.entity.Role;
import com.ticketing.entity.User;
import com.ticketing.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
public class TicketFlowIntegrationTest {
    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private MockMvc mockMvc;
    private ObjectMapper objectMapper = new ObjectMapper();
    private String accessToken;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        User user = new User();
        user.setEmail("ticketuser@example.com");
        user.setPasswordHash(passwordEncoder.encode("TestPass123!"));
        user.setFullName("Ticket User");
        user.setRole(Role.USER);
        user = userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("ticketuser@example.com");
        loginRequest.setPassword("TestPass123!");

        String response = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        AuthResponse authResponse = objectMapper.readValue(response, AuthResponse.class);
        accessToken = authResponse.getAccessToken();
    }

    @Test
    void testCreateTicket() throws Exception {
        TicketRequest request = new TicketRequest();
        request.setTitle("Test Ticket");
        request.setDescription("Test Description");
        request.setPriority(Priority.MEDIUM);

        mockMvc.perform(post("/api/tickets")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Test Ticket"))
                .andExpect(jsonPath("$.description").value("Test Description"));
    }

    @Test
    void testGetTickets() throws Exception {
        TicketRequest request = new TicketRequest();
        request.setTitle("List Ticket");
        request.setDescription("List Description");
        request.setPriority(Priority.LOW);

        mockMvc.perform(post("/api/tickets")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)));

        mockMvc.perform(get("/api/tickets")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").exists());
    }

    @Test
    void testAddComment() throws Exception {
        TicketRequest ticketRequest = new TicketRequest();
        ticketRequest.setTitle("Comment Ticket");
        ticketRequest.setDescription("Comment Description");
        ticketRequest.setPriority(Priority.MEDIUM);

        String ticketResponse = mockMvc.perform(post("/api/tickets")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ticketRequest)))
                .andReturn()
                .getResponse()
                .getContentAsString();

        TicketResponse ticket = objectMapper.readValue(ticketResponse, TicketResponse.class);

        CommentRequest commentRequest = new CommentRequest();
        commentRequest.setContent("Test comment");

        mockMvc.perform(post("/api/tickets/" + ticket.getId() + "/comments")
                .header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Test comment"));
    }
}

