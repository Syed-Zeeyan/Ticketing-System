package com.ticketing.dto;

import com.ticketing.entity.Priority;
import com.ticketing.entity.Status;

public class TicketSearchRequest {
    private String q;
    private Status status;
    private Priority priority;
    private Long assignee;
    private Integer page = 0;
    private Integer size = 20;

    public String getQ() {
        return q;
    }

    public void setQ(String q) {
        this.q = q;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public Long getAssignee() {
        return assignee;
    }

    public void setAssignee(Long assignee) {
        this.assignee = assignee;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }
}

