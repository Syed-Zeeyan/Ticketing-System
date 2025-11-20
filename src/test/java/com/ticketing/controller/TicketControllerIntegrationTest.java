package com.ticketing.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticketing.dto.*;
import com.ticketing.entity.Role;
import com.ticketing.entity.Status;
import com.ticketing.entity.User;
import com.ticketing.repository.UserRepository;
import com.ticketing.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureWebMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureWebMvc
@Testcontainers
@Transactional
class TicketControllerIntegrationTest {
    @Container
    @SuppressWarnings("resource")
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;
    private User testUser;
    private User testAgent;
    private User testAdmin;
    private String userToken;
    private String agentToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        testUser = createUser("user@test.com", "User", Role.USER);
        testAgent = createUser("agent@test.com", "Agent", Role.AGENT);
        testAdmin = createUser("admin@test.com", "Admin", Role.ADMIN);

        userToken = generateToken(testUser.getEmail());
        agentToken = generateToken(testAgent.getEmail());
        adminToken = generateToken(testAdmin.getEmail());
    }

    private User createUser(String email, String name, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("password123"));
        user.setFullName(name);
        user.setRole(role);
        return userRepository.save(user);
    }

    private String generateToken(String email) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        return jwtTokenProvider.generateAccessToken(userDetails);
    }

    @Test
    void testCreateTicket() throws Exception {
        TicketRequest request = new TicketRequest();
        request.setTitle("Test Ticket");
        request.setDescription("Test Description");
        request.setPriority(com.ticketing.entity.Priority.HIGH);

        mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Ticket"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.ownerId").value(testUser.getId()));
    }

    @Test
    void testGetTicketById() throws Exception {
        TicketRequest createRequest = new TicketRequest();
        createRequest.setTitle("Test Ticket");
        createRequest.setDescription("Test Description");
        createRequest.setPriority(com.ticketing.entity.Priority.MEDIUM);

        String createResponse = mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        TicketResponse ticket = objectMapper.readValue(createResponse, TicketResponse.class);

        mockMvc.perform(get("/api/tickets/" + ticket.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(ticket.getId()))
                .andExpect(jsonPath("$.title").value("Test Ticket"));
    }

    @Test
    void testAddComment() throws Exception {
        TicketRequest createRequest = new TicketRequest();
        createRequest.setTitle("Test Ticket");
        createRequest.setDescription("Test Description");
        createRequest.setPriority(com.ticketing.entity.Priority.LOW);

        String createResponse = mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        TicketResponse ticket = objectMapper.readValue(createResponse, TicketResponse.class);

        CommentRequest commentRequest = new CommentRequest();
        commentRequest.setContent("This is a test comment");

        mockMvc.perform(post("/api/tickets/" + ticket.getId() + "/comments")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("This is a test comment"))
                .andExpect(jsonPath("$.ticketId").value(ticket.getId()))
                .andExpect(jsonPath("$.userId").value(testUser.getId()));
    }

    @Test
    void testUpdateStatusAsAgent() throws Exception {
        TicketRequest createRequest = new TicketRequest();
        createRequest.setTitle("Test Ticket");
        createRequest.setDescription("Test Description");
        createRequest.setPriority(com.ticketing.entity.Priority.HIGH);

        String createResponse = mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        TicketResponse ticket = objectMapper.readValue(createResponse, TicketResponse.class);

        UpdateStatusRequest statusRequest = new UpdateStatusRequest();
        statusRequest.setStatus(Status.IN_PROGRESS);

        mockMvc.perform(post("/api/tickets/" + ticket.getId() + "/status")
                        .header("Authorization", "Bearer " + agentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    void testUpdateStatusAsUserShouldFail() throws Exception {
        TicketRequest createRequest = new TicketRequest();
        createRequest.setTitle("Test Ticket");
        createRequest.setDescription("Test Description");
        createRequest.setPriority(com.ticketing.entity.Priority.MEDIUM);

        String createResponse = mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        TicketResponse ticket = objectMapper.readValue(createResponse, TicketResponse.class);

        UpdateStatusRequest statusRequest = new UpdateStatusRequest();
        statusRequest.setStatus(Status.RESOLVED);

        mockMvc.perform(post("/api/tickets/" + ticket.getId() + "/status")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(statusRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testAssignTicketAsAdmin() throws Exception {
        TicketRequest createRequest = new TicketRequest();
        createRequest.setTitle("Test Ticket");
        createRequest.setDescription("Test Description");
        createRequest.setPriority(com.ticketing.entity.Priority.CRITICAL);

        String createResponse = mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        TicketResponse ticket = objectMapper.readValue(createResponse, TicketResponse.class);

        AssignTicketRequest assignRequest = new AssignTicketRequest();
        assignRequest.setAssigneeId(testAgent.getId());

        mockMvc.perform(post("/api/tickets/" + ticket.getId() + "/assign")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assigneeId").value(testAgent.getId()));
    }

    @Test
    void testGetAllTicketsAsUser() throws Exception {
        TicketRequest request1 = new TicketRequest();
        request1.setTitle("Ticket 1");
        request1.setDescription("Description 1");
        request1.setPriority(com.ticketing.entity.Priority.LOW);

        TicketRequest request2 = new TicketRequest();
        request2.setTitle("Ticket 2");
        request2.setDescription("Description 2");
        request2.setPriority(com.ticketing.entity.Priority.MEDIUM);

        mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/tickets")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void testGetAllTicketsAsAgent() throws Exception {
        TicketRequest request = new TicketRequest();
        request.setTitle("User Ticket");
        request.setDescription("Description");
        request.setPriority(com.ticketing.entity.Priority.HIGH);

        mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/tickets")
                        .header("Authorization", "Bearer " + agentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void testUserCannotAccessOtherUserTicket() throws Exception {
        User otherUser = createUser("other@test.com", "Other User", Role.USER);
        String otherUserToken = generateToken(otherUser.getEmail());

        TicketRequest request = new TicketRequest();
        request.setTitle("Other User Ticket");
        request.setDescription("Description");
        request.setPriority(com.ticketing.entity.Priority.MEDIUM);

        String createResponse = mockMvc.perform(post("/api/tickets")
                        .header("Authorization", "Bearer " + otherUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        TicketResponse ticket = objectMapper.readValue(createResponse, TicketResponse.class);

        mockMvc.perform(get("/api/tickets/" + ticket.getId())
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isBadRequest());
    }
}

