package com.ticketing.dto;

import com.ticketing.entity.Priority;
import java.math.BigDecimal;
import java.util.List;

public class TriagePredictionResponse {
    private String category;
    private Priority suggestedPriority;
    private BigDecimal urgencyScore;
    private Long suggestedAssigneeId;
    private BigDecimal confidence;
    private List<String> keywords;
    private BigDecimal predictedSlaBreachProbability;

    public TriagePredictionResponse() {
    }

    public TriagePredictionResponse(String category, Priority suggestedPriority,
                                   BigDecimal urgencyScore, Long suggestedAssigneeId,
                                   BigDecimal confidence, List<String> keywords) {
        this.category = category;
        this.suggestedPriority = suggestedPriority;
        this.urgencyScore = urgencyScore;
        this.suggestedAssigneeId = suggestedAssigneeId;
        this.confidence = confidence;
        this.keywords = keywords;
        this.predictedSlaBreachProbability = calculateSlaBreachProbability(urgencyScore);
    }

    private BigDecimal calculateSlaBreachProbability(BigDecimal urgencyScore) {
        double score = urgencyScore.doubleValue();
        double probability = 0.0;
        if (score >= 0.8) {
            probability = 0.85;
        } else if (score >= 0.6) {
            probability = 0.60;
        } else if (score >= 0.4) {
            probability = 0.30;
        } else {
            probability = 0.10;
        }
        return BigDecimal.valueOf(probability).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Priority getSuggestedPriority() {
        return suggestedPriority;
    }

    public void setSuggestedPriority(Priority suggestedPriority) {
        this.suggestedPriority = suggestedPriority;
    }

    public BigDecimal getUrgencyScore() {
        return urgencyScore;
    }

    public void setUrgencyScore(BigDecimal urgencyScore) {
        this.urgencyScore = urgencyScore;
    }

    public Long getSuggestedAssigneeId() {
        return suggestedAssigneeId;
    }

    public void setSuggestedAssigneeId(Long suggestedAssigneeId) {
        this.suggestedAssigneeId = suggestedAssigneeId;
    }

    public BigDecimal getConfidence() {
        return confidence;
    }

    public void setConfidence(BigDecimal confidence) {
        this.confidence = confidence;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(List<String> keywords) {
        this.keywords = keywords;
    }

    public BigDecimal getPredictedSlaBreachProbability() {
        return predictedSlaBreachProbability;
    }

    public void setPredictedSlaBreachProbability(BigDecimal predictedSlaBreachProbability) {
        this.predictedSlaBreachProbability = predictedSlaBreachProbability;
    }
}

