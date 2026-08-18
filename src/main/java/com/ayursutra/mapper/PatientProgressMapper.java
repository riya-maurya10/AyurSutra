package com.ayursutra.mapper;

import com.ayursutra.dto.request.PatientProgressRequest;
import com.ayursutra.dto.response.PatientProgressResponse;
import com.ayursutra.entity.PatientProgress;
import org.springframework.stereotype.Component;

@Component
public class PatientProgressMapper {

    public PatientProgress toEntity(
            PatientProgressRequest request) {

        PatientProgress progress =
                new PatientProgress();

        progress.setPatientId(
                request.getPatientId()
        );

        progress.setTherapyPlanId(
                request.getTherapyPlanId()
        );

        progress.setAssessmentDate(
                request.getAssessmentDate()
        );

        progress.setDayNumber(
                request.getDayNumber()
        );

        progress.setSymptoms(
                request.getSymptoms()
        );

        progress.setObservations(
                request.getObservations()
        );

        progress.setImprovementPercentage(
                request.getImprovementPercentage()
        );

        progress.setTherapyResponse(
                request.getTherapyResponse()
        );

        progress.setPractitionerNotes(
                request.getPractitionerNotes()
        );

        progress.setNextRecommendation(
                request.getNextRecommendation()
        );

        return progress;
    }


    public PatientProgressResponse toResponse(
            PatientProgress progress) {

        return new PatientProgressResponse(

                progress.getId(),

                progress.getPatientId(),

                progress.getTherapyPlanId(),

                progress.getAssessmentDate(),

                progress.getDayNumber(),

                progress.getSymptoms(),

                progress.getObservations(),

                progress.getImprovementPercentage(),

                progress.getTherapyResponse(),

                progress.getPractitionerNotes(),

                progress.getNextRecommendation()
        );
    }
}