package com.veturnos.backend.service;

import com.veturnos.backend.dto.ReservaRequest;
import com.veturnos.backend.dto.ReservaResponse;
import com.veturnos.backend.enums.EstadoReserva;
import com.veturnos.backend.model.Cliente;
import com.veturnos.backend.model.Mascota;
import com.veturnos.backend.model.Reserva;
import com.veturnos.backend.model.Veterinario;
import com.veturnos.backend.repository.ClienteRepository;
import com.veturnos.backend.repository.MascotaRepository;
import com.veturnos.backend.repository.ReservaRepository;
import com.veturnos.backend.repository.VeterinarioRepository; // 🚀 E2: Importamos el nuevo repositorio
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository; // 🚀 E2: Añadido para inyección

    public ReservaService(ReservaRepository reservaRepository, 
                          ClienteRepository clienteRepository, 
                          MascotaRepository mascotaRepository,
                          VeterinarioRepository veterinarioRepository) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.mascotaRepository = mascotaRepository;
        this.veterinarioRepository = veterinarioRepository;
    }

    @Transactional
    public ReservaResponse reservarTurno(ReservaRequest request) {
        if (request.getVeterinarioId() == null) {
            throw new IllegalArgumentException("Debe especificar un profesional médico veterinario");
        }

        // 1. Calcular el fin del nuevo turno según su duración
        int duracion = request.getDuracionMinutos() != null ? request.getDuracionMinutos() : 30;
        LocalDateTime fechaHoraFin = request.getFechaHora().plusMinutes(duracion);

        // 2. Validar solapamiento de rangos en la agenda PARTICULAR del veterinario seleccionado (US-03 / US-06)
        boolean seSolapa = reservaRepository.existeSolapamientoPorVeterinario(
                request.getFechaHora(), 
                fechaHoraFin, 
                request.getVeterinarioId(), 
                EstadoReserva.CANCELADO
        );
        if (seSolapa) {
            throw new IllegalArgumentException("El rango horario seleccionado se solapa con un turno del veterinario elegido");
        }

        // 3. Buscar Entidades
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new IllegalArgumentException("El cliente especificado no existe"));

        Mascota mascota = mascotaRepository.findById(request.getMascotaId())
                .orElseThrow(() -> new IllegalArgumentException("La mascota especificada no existe"));

        Veterinario veterinario = veterinarioRepository.findById(request.getVeterinarioId())
                .orElseThrow(() -> new IllegalArgumentException("El veterinario especificado no existe"));

        if (!mascota.getDueño().getId().equals(cliente.getId())) {
            throw new IllegalArgumentException("La mascota especificada no pertenece al cliente indicado");
        }

        // 4. Guardar un ÚNICO registro asociando el Veterinario y el Motivo
        Reserva nuevaReserva = new Reserva(mascota, cliente, veterinario, request.getFechaHora(), duracion, request.getMotivo());
        Reserva reservaGuardada = reservaRepository.save(nuevaReserva);

        return mapperAResponse(reservaGuardada);
    }

    @Transactional(noRollbackFor = IllegalStateException.class)
    public void cancelarReserva(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La reserva no existe"));

        boolean requiereRecargo = reserva.requiereRecargoPorCancelacion();

        reserva.cancelar();
        reservaRepository.save(reserva);

        if (requiereRecargo) {
            throw new IllegalStateException("Se cobrará un recargo por cancelación tardía debido a que faltan menos de 24 horas para la consulta");
        }
    }

    // 🚀 E2: Modificado para admitir filtrado horizontal por profesional
    @Transactional(readOnly = true)
    public List<ReservaResponse> obtenerAgendaDelDia(LocalDate fecha, Long veterinarioId) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);

        List<Reserva> reservas;
        if (veterinarioId != null) {
            reservas = reservaRepository.findReservasDelDiaPorVeterinario(inicio, fin, veterinarioId);
        } else {
            reservas = reservaRepository.findReservasDelDia(inicio, fin);
        }

        return reservas.stream()
                .map(this::mapperAResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservaResponse registrarAsistencia(Long id, String nuevoEstado) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La reserva no existe"));

        EstadoReserva estadoEnum;
        try {
            estadoEnum = EstadoReserva.valueOf(nuevoEstado.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Estado de asistencia inválido");
        }

        if (estadoEnum == EstadoReserva.ASISTIDO) {
            reserva.marcarComoAsistido();
        } else if (estadoEnum == EstadoReserva.COMPLETADO) {
            reserva.completar();
        } else {
            throw new IllegalArgumentException("Operación no permitida para este flujo de asistencia");
        }

        return mapperAResponse(reservaRepository.save(reserva));
    }

    // 🚀 E2: Nuevo método de servicio para guardar la Ficha Clínica / Observaciones Médicas (RF-12 / US-09)
    @Transactional
    public ReservaResponse guardarFichaClinica(Long id, String observaciones) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La reserva no existe"));

        // Se persiste el expediente clínico histórico en la reserva del paciente
        reserva.setObservaciones(observaciones);
        
        // Regla de Negocio: Al guardar la ficha médica pasamos automáticamente la reserva a COMPLETADO
        reserva.completar();

        return mapperAResponse(reservaRepository.save(reserva));
    }

    private ReservaResponse mapperAResponse(Reserva reserva) {
        return new ReservaResponse(
                reserva.getId(),
                reserva.getCliente().getNombreCompleto(),
                reserva.getMascota().getNombre(),
                reserva.getFechaHora(),
                reserva.getEstado().name(),
                reserva.getDuracionMinutos(),
                reserva.getObservaciones(), // 🚀 E2: Mapeamos observaciones hacia la respuesta DTO
                reserva.getMotivo()         // 🚀 E2: Mapeamos el motivo de consulta
        );
    }
}