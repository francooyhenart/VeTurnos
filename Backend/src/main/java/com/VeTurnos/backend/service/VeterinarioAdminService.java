package com.VeTurnos.backend.service;

import com.VeTurnos.backend.dto.VeterinarioRequest;
import com.VeTurnos.backend.dto.VeterinarioResponse;
import com.VeTurnos.backend.model.Veterinario;
import com.VeTurnos.backend.repository.VeterinarioRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VeterinarioAdminService {

    private final VeterinarioRepository veterinarioRepository;

    public VeterinarioAdminService(VeterinarioRepository veterinarioRepository) {
        this.veterinarioRepository = veterinarioRepository;
    }

    // CREATE
    public VeterinarioResponse crearVeterinario(VeterinarioRequest request) {
        if (veterinarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        if (veterinarioRepository.findByMatricula(request.getMatricula()).isPresent()) {
            throw new IllegalArgumentException("La matrícula ya existe");
        }

        Veterinario veterinario = new Veterinario(
            request.getNombreCompleto(),
            request.getDni(),
            request.getTelefono(),
            request.getEmail(),
            request.getPassword(),
            request.getMatricula(),
            request.getEspecialidad(),
            false  // No es administrador por defecto
        );

        Veterinario guardado = veterinarioRepository.save(veterinario);
        return convertirAResponse(guardado);
    }

    // READ - Obtener todos
    public List<VeterinarioResponse> obtenerTodos() {
        return veterinarioRepository.findAll()
            .stream()
            .map(this::convertirAResponse)
            .collect(Collectors.toList());
    }

    // READ - Obtener por ID
    public VeterinarioResponse obtenerPorId(Long id) {
        Veterinario veterinario = veterinarioRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Veterinario no encontrado"));
        return convertirAResponse(veterinario);
    }

    // UPDATE
    public VeterinarioResponse actualizarVeterinario(Long id, VeterinarioRequest request) {
        Veterinario veterinario = veterinarioRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Veterinario no encontrado"));

        // Validar email único (si cambió)
        if (!veterinario.getEmail().equals(request.getEmail()) &&
            veterinarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        // Actualizar campos
        veterinario.setNombreCompleto(request.getNombreCompleto());
        veterinario.setTelefono(request.getTelefono());
        veterinario.setEspecialidad(request.getEspecialidad());
        veterinario.setEmail(request.getEmail());
        veterinario.setPassword(request.getPassword());

        Veterinario actualizado = veterinarioRepository.save(veterinario);
        return convertirAResponse(actualizado);
    }

    // DELETE
    public void eliminarVeterinario(Long id) {
        if (!veterinarioRepository.existsById(id)) {
            throw new IllegalArgumentException("Veterinario no encontrado");
        }
        veterinarioRepository.deleteById(id);
    }

    // Helper
    private VeterinarioResponse convertirAResponse(Veterinario veterinario) {
        return new VeterinarioResponse(
            veterinario.getId(),
            veterinario.getNombreCompleto(),
            veterinario.getEmail(),
            veterinario.getMatricula(),
            veterinario.getEspecialidad()
        );
    }
}
