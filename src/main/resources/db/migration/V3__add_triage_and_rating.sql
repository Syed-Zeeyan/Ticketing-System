CREATE TABLE triage_logs (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT REFERENCES tickets(id),
    input_title VARCHAR(500),
    input_description TEXT,
    predicted_priority VARCHAR(50),
    urgency_score DECIMAL(3,2),
    assignee_id BIGINT REFERENCES users(id),
    confidence DECIMAL(3,2),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_ratings (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES tickets(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ticket_id)
);

ALTER TABLE tickets ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE tickets ADD COLUMN resolved_at TIMESTAMP;

CREATE INDEX idx_triage_logs_ticket ON triage_logs(ticket_id);
CREATE INDEX idx_ticket_ratings_ticket ON ticket_ratings(ticket_id);

