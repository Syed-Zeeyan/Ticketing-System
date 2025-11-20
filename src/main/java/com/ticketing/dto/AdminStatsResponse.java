package com.ticketing.dto;

import java.math.BigDecimal;

public class AdminStatsResponse {
    private Long openCount;
    private BigDecimal avgResolutionTime;
    private Long slaBreaches;
    private BigDecimal avgRating;

    public AdminStatsResponse() {
    }

    public AdminStatsResponse(Long openCount, BigDecimal avgResolutionTime, Long slaBreaches, BigDecimal avgRating) {
        this.openCount = openCount;
        this.avgResolutionTime = avgResolutionTime;
        this.slaBreaches = slaBreaches;
        this.avgRating = avgRating;
    }

    public Long getOpenCount() {
        return openCount;
    }

    public void setOpenCount(Long openCount) {
        this.openCount = openCount;
    }

    public BigDecimal getAvgResolutionTime() {
        return avgResolutionTime;
    }

    public void setAvgResolutionTime(BigDecimal avgResolutionTime) {
        this.avgResolutionTime = avgResolutionTime;
    }

    public Long getSlaBreaches() {
        return slaBreaches;
    }

    public void setSlaBreaches(Long slaBreaches) {
        this.slaBreaches = slaBreaches;
    }

    public BigDecimal getAvgRating() {
        return avgRating;
    }

    public void setAvgRating(BigDecimal avgRating) {
        this.avgRating = avgRating;
    }
}

