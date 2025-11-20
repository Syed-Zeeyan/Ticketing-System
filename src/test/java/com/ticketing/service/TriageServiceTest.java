package com.ticketing.service;

import com.ticketing.dto.TriagePredictionRequest;
import com.ticketing.dto.TriagePredictionResponse;
import com.ticketing.entity.Priority;
import com.ticketing.entity.Role;
import com.ticketing.entity.User;
import com.ticketing.repository.TriageLogRepository;
import com.ticketing.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TriageServiceTest {
    @Mock
    private UserRepository userRepository;

    @Mock
    private TriageLogRepository triageLogRepository;

    private TriageService triageService;
    private User agentUser;

    @BeforeEach
    void setUp() {
        triageService = new TriageService(userRepository, triageLogRepository);

        agentUser = new User();
        agentUser.setId(1L);
        agentUser.setRole(Role.AGENT);
        agentUser.setEmail("agent@example.com");
        agentUser.setFullName("Agent User");

        when(userRepository.findByRole(Role.AGENT)).thenReturn(Arrays.asList(agentUser));
        when(triageLogRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testPredictCriticalPriority() {
        TriagePredictionRequest request = new TriagePredictionRequest();
        request.setTitle("Critical system down");
        request.setDescription("The entire system is down and users cannot access anything");

        TriagePredictionResponse response = triageService.predict(request);

        assertNotNull(response);
        assertEquals(Priority.CRITICAL, response.getSuggestedPriority());
        assertTrue(response.getUrgencyScore().doubleValue() > 0.7);
        assertTrue(response.getConfidence().doubleValue() > 0.5);
    }

    @Test
    void testPredictHighPriority() {
        TriagePredictionRequest request = new TriagePredictionRequest();
        request.setTitle("Server error");
        request.setDescription("Getting errors when trying to access the server");

        TriagePredictionResponse response = triageService.predict(request);

        assertNotNull(response);
        assertTrue(response.getSuggestedPriority() == Priority.HIGH || 
                   response.getSuggestedPriority() == Priority.CRITICAL);
        assertTrue(response.getUrgencyScore().doubleValue() > 0.5);
    }

    @Test
    void testPredictMediumPriority() {
        TriagePredictionRequest request = new TriagePredictionRequest();
        request.setTitle("Application issue");
        request.setDescription("Having a problem with the application");

        TriagePredictionResponse response = triageService.predict(request);

        assertNotNull(response);
        assertTrue(response.getSuggestedPriority() == Priority.MEDIUM || 
                   response.getSuggestedPriority() == Priority.HIGH);
        assertNotNull(response.getUrgencyScore());
    }

    @Test
    void testPredictLowPriority() {
        TriagePredictionRequest request = new TriagePredictionRequest();
        request.setTitle("Question about feature");
        request.setDescription("I have a question about how to use this feature");

        TriagePredictionResponse response = triageService.predict(request);

        assertNotNull(response);
        assertTrue(response.getSuggestedPriority() == Priority.LOW || 
                   response.getSuggestedPriority() == Priority.MEDIUM);
        assertTrue(response.getUrgencyScore().doubleValue() < 0.5);
    }

    @Test
    void testCategoryDetection() {
        TriagePredictionRequest request = new TriagePredictionRequest();
        request.setTitle("Cannot login");
        request.setDescription("I forgot my password and cannot login to the system");

        TriagePredictionResponse response = triageService.predict(request);

        assertNotNull(response);
        assertNotNull(response.getCategory());
        assertEquals("Authentication", response.getCategory());
    }

    @Test
    void testKeywordExtraction() {
        TriagePredictionRequest request = new TriagePredictionRequest();
        request.setTitle("Network connection failed");
        request.setDescription("Unable to connect to the network");

        TriagePredictionResponse response = triageService.predict(request);

        assertNotNull(response);
        assertNotNull(response.getKeywords());
        assertTrue(response.getKeywords().size() > 0);
    }

    @Test
    void testSlaBreachProbability() {
        TriagePredictionRequest request = new TriagePredictionRequest();
        request.setTitle("Critical urgent issue");
        request.setDescription("This is a critical and urgent problem that needs immediate attention");

        TriagePredictionResponse response = triageService.predict(request);

        assertNotNull(response);
        assertTrue(response.getPredictedSlaBreachProbability().doubleValue() >= 0.0);
        assertTrue(response.getPredictedSlaBreachProbability().doubleValue() <= 1.0);
    }

    @Test
    void testAssigneeSuggestion() {
        TriagePredictionRequest request = new TriagePredictionRequest();
        request.setTitle("High priority issue");
        request.setDescription("This is a high priority problem");

        TriagePredictionResponse response = triageService.predict(request);

        assertNotNull(response);
        if (response.getSuggestedAssigneeId() != null) {
            assertEquals(agentUser.getId(), response.getSuggestedAssigneeId());
        }
    }
}
