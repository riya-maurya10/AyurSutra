package com.ayursutra.service.impl;

import com.ayursutra.dto.request.TherapyRequest;
import com.ayursutra.dto.response.TherapyResponse;
import com.ayursutra.entity.Therapy;
import com.ayursutra.mapper.TherapyMapper;
import com.ayursutra.repository.TherapyRepository;
import com.ayursutra.service.TherapyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TherapyServiceImpl implements TherapyService {

    private final TherapyRepository therapyRepository;
    private final TherapyMapper therapyMapper;

    @Override
    public TherapyResponse createTherapy(
            TherapyRequest request) {

        if (therapyRepository.existsByName(request.getName())) {
            throw new RuntimeException(
                    "Therapy with this name already exists"
            );
        }

        Therapy therapy =
                therapyMapper.toEntity(request);

        Therapy savedTherapy =
                therapyRepository.save(therapy);

        return therapyMapper.toResponse(savedTherapy);
    }

    @Override
    public List<TherapyResponse> getAllTherapies() {

        return therapyRepository.findAll()
                .stream()
                .map(therapyMapper::toResponse)
                .toList();
    }

    @Override
    public TherapyResponse getTherapyById(String id) {

        Therapy therapy =
                therapyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy not found"
                                ));

        return therapyMapper.toResponse(therapy);
    }

    @Override
    public TherapyResponse updateTherapy(
            String id,
            TherapyRequest request) {

        Therapy therapy =
                therapyRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Therapy not found"
                                ));

        therapy.setName(request.getName());
        therapy.setStage(request.getStage());
        therapy.setDescription(request.getDescription());
        therapy.setDurationMinutes(
                request.getDurationMinutes()
        );

        therapy.setActive(
                request.getActive() != null
                        ? request.getActive()
                        : therapy.getActive()
        );

        Therapy updatedTherapy =
                therapyRepository.save(therapy);

        return therapyMapper.toResponse(updatedTherapy);
    }

    @Override
    public void deleteTherapy(String id) {

        if (!therapyRepository.existsById(id)) {
            throw new RuntimeException(
                    "Therapy not found"
            );
        }

        therapyRepository.deleteById(id);
    }
}