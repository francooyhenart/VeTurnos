// GestorService.java

package com.VeTurnos.backend.service;

import com.VeTurnos.backend.model.Veterinario;
import com.VeTurnos.backend.model.Reserva;
import com.VeTurnos.backend.repository.VeterinarioRepository;
import com.VeTurnos.backend.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class GestorService {

    private final VeterinarioRepository veterinarioRepository;
    private final ReservaRepository reservaRepository;

    public GestorService(VeterinarioRepository veterinarioRepository, ReservaRepository reservaRepository) {
        this.veterinarioRepository = veterinarioRepository;
        this.reservaRepository = reservaRepository;
    }

    /**
     * CREATE - Crear nuevo veterinario
     */
    public Veterinario crearVeterinario(String nombreCompleto, String dni, String telefono,
                                         String email, String password, String matricula,
                                         String especialidad) {
        // Validar que email sea único
        if (veterinarioRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("El email ya está registrado en el sistema");
        }

        // Validar que matrícula sea única
        if (veterinarioRepository.findByMatricula(matricula).isPresent()) {
            throw new IllegalArgumentException("La matrícula profesional ya existe");
        }

        Veterinario veterinario = new Veterinario(
            nombreCompleto,
            dni,
            telefono,
            email,
            password,
            matricula,
            especialidad,
            false  // No es administrador por defecto
        );

        return veterinarioRepository.save(veterinario);
    }

    /**
     * READ - Obtener todos los veterinarios
     */
    @Transactional(readOnly = true)
    public List<Veterinario> obtenerTodosLosVeterinarios() {
        return veterinarioRepository.findAll();
    }

    /**
     * READ - Obtener veterinario por ID
     */
    @Transactional(readOnly = true)
    public Veterinario obtenerVeterinarioPorId(Long id) {
        return veterinarioRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Veterinario no encontrado con ID: " + id));
    }

    /**
     * READ - Obtener veterinario por matrícula
     */
    @Transactional(readOnly = true)
    public Veterinario obtenerVeterinarioPorMatricula(String matricula) {
        return veterinarioRepository.findByMatricula(matricula)
            .orElseThrow(() -> new IllegalArgumentException("Veterinario no encontrado con matrícula: " + matricula));
    }

    /**
     * UPDATE - Actualizar datos del veterinario
     */
    public Veterinario actualizarVeterinario(Long id, String nombreCompleto, String telefono,
                                             String especialidad) {
        Veterinario veterinario = obtenerVeterinarioPorId(id);

        if (nombreCompleto != null && !nombreCompleto.trim().isEmpty()) {
            veterinario.setNombreCompleto(nombreCompleto);
        }

        if (telefono != null && !telefono.trim().isEmpty()) {
            veterinario.setTelefono(telefono);
        }

        if (especialidad != null) {
            veterinario.setEspecialidad(especialidad);
        }

        return veterinarioRepository.save(veterinario);
    }

    /**
     * UPDATE - Cambiar estado de administrador
     */
    public Veterinario cambiarEstadoAdministrador(Long id, Boolean esAdmin) {
        Veterinario veterinario = obtenerVeterinarioPorId(id);
        veterinario.setEsAdministrador(esAdmin != null ? esAdmin : false);
        return veterinarioRepository.save(veterinario);
    }

    /**
     * DELETE - Eliminar veterinario
     */
    public void eliminarVeterinario(Long id) {
        if (!veterinarioRepository.existsById(id)) {
            throw new IllegalArgumentException("Veterinario no encontrado con ID: " + id);
        }
        veterinarioRepository.deleteById(id);
    }

    /**
     * READ - Obtener estadísticas de veterinarios
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticasVeterinarios() {
        List<Veterinario> veterinarios = veterinarioRepository.findAll();
        List<Reserva> todasLasReservas = reservaRepository.findAll();

        Map<String, Object> estadisticas = new HashMap<>();
        estadisticas.put("totalVeterinarios", veterinarios.size());
        estadisticas.put("totalAdministradores", 
            veterinarios.stream().filter(Veterinario::getEsAdministrador).count());
        estadisticas.put("totalReservas", todasLasReservas.size());

        return estadisticas;
    }

    /**
     * READ - Obtener agenda completa de todos los veterinarios
     * Retorna un mapa con la información de veterinarios y sus reservas
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerAgendaCompleta() {
        List<Veterinario> veterinarios = veterinarioRepository.findAll();
        List<Reserva> todasLasReservas = reservaRepository.findAll();

        Map<String, Object> agendaCompleta = new HashMap<>();
        
        // Información general
        agendaCompleta.put("fechaConsulta", new Date());
        agendaCompleta.put("totalVeterinarios", veterinarios.size());
        agendaCompleta.put("totalReservas", todasLasReservas.size());

        // Detalles de cada veterinario
        List<Map<String, Object>> detallesVeterinarios = veterinarios.stream()
            .map(vet -> {
                Map<String, Object> detalle = new HashMap<>();
                detalle.put("id", vet.getId());
                detalle.put("nombre", vet.getNombreCompleto());
                detalle.put("matricula", vet.getMatricula());
                detalle.put("especialidad", vet.getEspecialidad());
                detalle.put("esAdministrador", vet.getEsAdministrador());
                detalle.put("totalReservas", todasLasReservas.size()); // En el futuro, filtrar por vet
                return detalle;
            })
            .collect(Collectors.toList());

        agendaCompleta.put("veterinarios", detallesVeterinarios);
        agendaCompleta.put("reservas", todasLasReservas);

        return agendaCompleta;
    }

    /**
     * READ - Obtener información resumida de todos los veterinarios
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerResumenVeterinarios() {
        return veterinarioRepository.findAll()
            .stream()
            .map(vet -> {
                Map<String, Object> resumen = new HashMap<>();
                resumen.put("id", vet.getId());
                resumen.put("nombre", vet.getNombreCompleto());
                resumen.put("email", vet.getEmail());
                resumen.put("matricula", vet.getMatricula());
                resumen.put("especialidad", vet.getEspecialidad());
                resumen.put("esAdministrador", vet.getEsAdministrador());
                return resumen;
            })
            .collect(Collectors.toList());
    }

    /**
     * READ - Obtener agenda de un veterinario específico
     */
    @Transactional(readOnly = true)
    public List<Reserva> obtenerAgendaVeterinario(Long veterinarioId) {
        Veterinario vet = veterinarioRepository.findById(veterinarioId)
            .orElseThrow(() -> new IllegalArgumentException("Veterinario no encontrado"));
        return reservaRepository.findByVeterinario(vet);
    }
}
