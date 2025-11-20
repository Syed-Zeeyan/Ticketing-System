package com.ticketing.repository;

import com.ticketing.entity.TriageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TriageLogRepository extends JpaRepository<TriageLog, Long> {
}

