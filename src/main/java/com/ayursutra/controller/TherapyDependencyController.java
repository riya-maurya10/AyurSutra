package com.ayursutra.controller;

import com.ayursutra.dto.request.TherapyDependencyRequest;
import com.ayursutra.dto.response.TherapyDependencyResponse;
import com.ayursutra.service.TherapyDependencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/therapy-dependencies")
@RequiredArgsConstructor
public class TherapyDependencyController {

    private final TherapyDependencyService dependencyService;

    @PostMapping
    public ResponseEntity<?> createDependency(
            @Valid @RequestBody TherapyDependencyRequest request) {

        return ResponseEntity.ok(
                dependencyService.createDependency(request)
        );
    }

    @GetMapping
    public ResponseEntity<List<TherapyDependencyResponse>>
    getAllDependencies() {

        return ResponseEntity.ok(
                dependencyService.getAllDependencies()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<TherapyDependencyResponse>
    getDependencyById(@PathVariable String id) {

        return ResponseEntity.ok(
                dependencyService.getDependencyById(id)
        );
    }

    @GetMapping("/therapy/{therapyId}")
    public ResponseEntity<List<TherapyDependencyResponse>>
    getDependenciesByTherapy(
            @PathVariable String therapyId) {

        return ResponseEntity.ok(
                dependencyService
                        .getDependenciesByTherapy(therapyId)
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<TherapyDependencyResponse>
    updateDependency(
            @PathVariable String id,
            @Valid @RequestBody TherapyDependencyRequest request) {

        return ResponseEntity.ok(
                dependencyService.updateDependency(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDependency(
            @PathVariable String id) {

        dependencyService.deleteDependency(id);

        return ResponseEntity.ok(
                "Therapy dependency deleted successfully"
        );
    }
}