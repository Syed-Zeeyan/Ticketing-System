package com.ticketing.controller;

import com.ticketing.dto.TriagePredictionRequest;
import com.ticketing.dto.TriagePredictionResponse;
import com.ticketing.service.TriageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/triage")
public class TriageController {
    private final TriageService triageService;

    public TriageController(TriageService triageService) {
        this.triageService = triageService;
    }

    @PostMapping("/predict")
    public ResponseEntity<TriagePredictionResponse> predict(@Valid @RequestBody TriagePredictionRequest request) {
        TriagePredictionResponse response = triageService.predict(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/model-info")
    public ResponseEntity<Map<String, Object>> getModelInfo() {
        return ResponseEntity.ok(triageService.getModelInfo());
    }
}

