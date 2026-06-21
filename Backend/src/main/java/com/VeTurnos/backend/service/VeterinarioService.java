// VeterinarioService.java (Nuevo para Entrega 2 - Cartilla Médica)

package com.veturnos.backend.service;

import com.veturnos.backend.model.Veterinario;
import com.veturnos.backend.repository.VeterinarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class VeterinarioService {

    private final VeterinarioRepository veterinarioRepository;

    public VeterinarioService(VeterinarioRepository veterinarioRepository) {
        this.veterinarioRepository = veterinarioRepository;
    }

    /**
     * Trae todos los profesionales médicos veterinarios registrados
     * para mapear la cartilla dinámica en la pantalla de reservas.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listarCartillaMedica() {
        List<Veterinario> veterinarios = veterinarioRepository.findAll();
        
        return veterinarios.stream().map(v -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", v.getId());
            dto.put("nombre", v.getNombreCompleto());
            dto.put("especialidad", v.getEspecialidad() != null ? v.getEspecialidad() : "General");
            dto.put("matricula", v.getMatricula());
            return dto;
        }).collect(Collectors.toList());
    }
}