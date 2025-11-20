package com.ticketing.service;

import com.ticketing.dto.TriagePredictionRequest;
import com.ticketing.dto.TriagePredictionResponse;
import com.ticketing.entity.Priority;
import com.ticketing.entity.Role;
import com.ticketing.entity.TriageLog;
import com.ticketing.entity.User;
import com.ticketing.repository.TriageLogRepository;
import com.ticketing.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TriageService {
    private final UserRepository userRepository;
    private final TriageLogRepository triageLogRepository;

    private static final Map<String, Double> URGENCY_KEYWORDS = new HashMap<>() {{
        put("critical", 0.9);
        put("urgent", 0.8);
        put("down", 0.85);
        put("broken", 0.75);
        put("error", 0.7);
        put("failed", 0.7);
        put("cannot", 0.65);
        put("unable", 0.65);
        put("issue", 0.5);
        put("problem", 0.5);
        put("help", 0.4);
        put("question", 0.3);
    }};

    private static final Map<String, String> CATEGORY_KEYWORDS = new HashMap<>() {{
        put("login", "Authentication");
        put("password", "Authentication");
        put("access", "Access Control");
        put("email", "Email");
        put("network", "Network");
        put("server", "Infrastructure");
        put("database", "Database");
        put("application", "Application");
        put("hardware", "Hardware");
        put("software", "Software");
    }};

    public TriageService(UserRepository userRepository, TriageLogRepository triageLogRepository) {
        this.userRepository = userRepository;
        this.triageLogRepository = triageLogRepository;
    }

    public TriagePredictionResponse predict(TriagePredictionRequest request) {
        String title = request.getTitle().toLowerCase();
        String description = request.getDescription().toLowerCase();
        String combined = title + " " + description;

        double urgencyScore = calculateUrgencyScore(combined);
        Priority suggestedPriority = determinePriority(urgencyScore);
        String category = determineCategory(combined);
        User suggestedAssignee = findBestAssignee(suggestedPriority, category);
        double confidence = calculateConfidence(combined, urgencyScore);
        List<String> keywords = extractKeywords(combined);

        return new TriagePredictionResponse(
            category,
            suggestedPriority,
            BigDecimal.valueOf(urgencyScore).setScale(2, RoundingMode.HALF_UP),
            suggestedAssignee != null ? suggestedAssignee.getId() : null,
            BigDecimal.valueOf(confidence).setScale(2, RoundingMode.HALF_UP),
            keywords
        );
    }

    @Transactional
    public void logPrediction(Long ticketId, TriagePredictionRequest request, TriagePredictionResponse response) {
        TriageLog log = new TriageLog();
        log.setTicket(ticketId != null ? new com.ticketing.entity.Ticket() {{ setId(ticketId); }} : null);
        log.setInputTitle(request.getTitle());
        log.setInputDescription(request.getDescription());
        log.setPredictedPriority(response.getSuggestedPriority().name());
        log.setUrgencyScore(response.getUrgencyScore());
        log.setConfidence(response.getConfidence());
        if (response.getSuggestedAssigneeId() != null) {
            userRepository.findById(response.getSuggestedAssigneeId()).ifPresent(log::setAssignee);
        }
        triageLogRepository.save(log);
    }

    private double calculateUrgencyScore(String text) {
        double maxUrgency = 0.0;
        for (Map.Entry<String, Double> entry : URGENCY_KEYWORDS.entrySet()) {
            if (text.contains(entry.getKey())) {
                maxUrgency = Math.max(maxUrgency, entry.getValue());
            }
        }

        int exclamationCount = (int) text.chars().filter(ch -> ch == '!').count();
        int questionCount = (int) text.chars().filter(ch -> ch == '?').count();
        double punctuationBoost = Math.min(0.2, (exclamationCount * 0.05) + (questionCount * 0.02));

        return Math.min(1.0, maxUrgency + punctuationBoost);
    }

    private Priority determinePriority(double urgencyScore) {
        if (urgencyScore >= 0.8) {
            return Priority.CRITICAL;
        } else if (urgencyScore >= 0.6) {
            return Priority.HIGH;
        } else if (urgencyScore >= 0.4) {
            return Priority.MEDIUM;
        } else {
            return Priority.LOW;
        }
    }

    private String determineCategory(String text) {
        for (Map.Entry<String, String> entry : CATEGORY_KEYWORDS.entrySet()) {
            if (text.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return "General";
    }

    private User findBestAssignee(Priority priority, String category) {
        List<User> agents = userRepository.findAll().stream()
            .filter(u -> u.getRole() == Role.AGENT || u.getRole() == Role.ADMIN)
            .collect(Collectors.toList());

        if (agents.isEmpty()) {
            return null;
        }

        if (priority == Priority.CRITICAL || priority == Priority.HIGH) {
            List<User> admins = agents.stream()
                .filter(u -> u.getRole() == Role.ADMIN)
                .collect(Collectors.toList());
            if (!admins.isEmpty()) {
                return admins.get(new Random().nextInt(admins.size()));
            }
        }

        return agents.get(new Random().nextInt(agents.size()));
    }

    private double calculateConfidence(String text, double urgencyScore) {
        double keywordConfidence = 0.0;
        int keywordCount = 0;

        for (String keyword : URGENCY_KEYWORDS.keySet()) {
            if (text.contains(keyword)) {
                keywordConfidence += URGENCY_KEYWORDS.get(keyword);
                keywordCount++;
            }
        }

        if (keywordCount > 0) {
            keywordConfidence = keywordConfidence / keywordCount;
        }

        double lengthConfidence = Math.min(1.0, text.length() / 200.0);

        return (urgencyScore * 0.6) + (keywordConfidence * 0.3) + (lengthConfidence * 0.1);
    }

    private List<String> extractKeywords(String text) {
        return URGENCY_KEYWORDS.entrySet().stream()
            .filter(entry -> text.contains(entry.getKey()))
            .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
            .limit(3)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    public Map<String, Object> getModelInfo() {
        return Map.of(
            "modelType", "Rule-based + Heuristics",
            "version", "1.0.0",
            "features", List.of("keyword_matching", "urgency_scoring", "priority_determination", "assignee_suggestion"),
            "trainingDataSize", 0,
            "lastUpdated", "2024-01-01"
        );
    }
}

