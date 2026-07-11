package com.veturnos.backend.service;

import com.veturnos.backend.dto.SedeResponse;
import com.veturnos.backend.dto.VeterinarioRequest;
import com.veturnos.backend.dto.VeterinarioResponse;
import com.veturnos.backend.model.Sede;
import com.veturnos.backend.model.Veterinario;
import com.veturnos.backend.repository.SedeRepository;
import com.veturnos.backend.repository.VeterinarioRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VeterinarioAdminService {

    private final VeterinarioRepository veterinarioRepository;
    private final SedeRepository sedeRepository;

    public VeterinarioAdminService(VeterinarioRepository veterinarioRepository, SedeRepository sedeRepository) {
        this.veterinarioRepository = veterinarioRepository;
        this.sedeRepository = sedeRepository;
    }

    public VeterinarioResponse crearVeterinario(VeterinarioRequest request) {
        if (veterinarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado");
        }
        if (veterinarioRepository.findByMatricula(request.getMatricula()).isPresent()) {
            throw new IllegalArgumentException("La matrícula ya existe");
        }
        validarFranjaHoraria(request.getHoraInicio(), request.getHoraFin());

        Veterinario veterinario = new Veterinario(
                request.getNombreCompleto(),
                request.getDni(),
                request.getTelefono(),
                request.getEmail(),
                request.getPassword(),
                request.getMatricula(),
                request.getEspecialidad(),
                false,
                request.getHoraInicio(),
                request.getHoraFin()
        );

        if (request.getSedeId() != null) {
            Sede sede = sedeRepository.findById(request.getSedeId())
                    .orElseThrow(() -> new IllegalArgumentException("La sede especificada no existe"));
            veterinario.setSede(sede);
        }

        Veterinario guardado = veterinarioRepository.save(veterinario);
        return convertirAResponse(guardado);
    }

    public List<VeterinarioResponse> obtenerTodos() {
        return veterinarioRepository.findAll().stream().map(this::convertirAResponse).collect(Collectors.toList());
    }

    public VeterinarioResponse obtenerPorId(Long id) {
        Veterinario veterinario = veterinarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Veterinario no encontrado"));
        return convertirAResponse(veterinario);
    }

    public VeterinarioResponse actualizarVeterinario(Long id, VeterinarioRequest request) {
        Veterinario veterinario = veterinarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Veterinario no encontrado"));

        if (!veterinario.getEmail().equals(request.getEmail()) &&
                veterinarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado");
        }

        validarFranjaHoraria(request.getHoraInicio(), request.getHoraFin());

        veterinario.setNombreCompleto(request.getNombreCompleto());
        veterinario.setTelefono(request.getTelefono());
        veterinario.setEspecialidad(request.getEspecialidad());
        veterinario.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            veterinario.setPassword(request.getPassword());
        }
        veterinario.setHoraInicio(request.getHoraInicio());
        veterinario.setHoraFin(request.getHoraFin());

        if (request.getSedeId() != null) {
            Sede sede = sedeRepository.findById(request.getSedeId())
                    .orElseThrow(() -> new IllegalArgumentException("La sede especificada no existe"));
            veterinario.setSede(sede);
        } else {
            veterinario.setSede(null);
        }

        Veterinario actualizado = veterinarioRepository.save(veterinario);
        return convertirAResponse(actualizado);
    }

    public void eliminarVeterinario(Long id) {
        if (!veterinarioRepository.existsById(id)) throw new IllegalArgumentException("Veterinario no encontrado");
        veterinarioRepository.deleteById(id);
    }

    private void validarFranjaHoraria(LocalTime horaInicio, LocalTime horaFin) {
        if (horaInicio != null && horaFin != null && !horaInicio.isBefore(horaFin)) {
            throw new IllegalArgumentException("La hora de inicio debe ser anterior a la hora de fin");
        }
    }

    private VeterinarioResponse convertirAResponse(Veterinario veterinario) {
        SedeResponse sedeResp = null;
        if (veterinario.getSede() != null) {
            Sede s = veterinario.getSede();
            sedeResp = new SedeResponse(s.getId(), s.getNombre(), s.getCalle(), s.getNumero(), s.getEntreCalles(), s.getCalle() + " " + s.getNumero());
        }
        return new VeterinarioResponse(
                veterinario.getId(),
                veterinario.getNombreCompleto(),
                veterinario.getEmail(),
                veterinario.getMatricula(),
                veterinario.getEspecialidad(),
                veterinario.getTelefono(),
                sedeResp,
                veterinario.getHoraInicio(),
                veterinario.getHoraFin()
        );
    }
}