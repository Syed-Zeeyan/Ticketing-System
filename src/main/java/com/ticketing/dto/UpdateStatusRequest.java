package com.ticketing.dto;

import com.ticketing.entity.Status;
import jakarta.validation.constraints.NotNull;

public class UpdateStatusRequest {
    @NotNull(message = "Status is required")
    private Status status;

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}

