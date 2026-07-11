package com.veturnos.backend.service;

import com.veturnos.backend.dto.ReservaRequest;
import com.veturnos.backend.dto.ReservaResponse;
import com.veturnos.backend.dto.MetricaSedeDTO;
import com.veturnos.backend.dto.MetricaVeterinarioDTO;
import com.veturnos.backend.dto.EstadisticasResponse;
import com.veturnos.backend.dto.HistorialClinicoResponse;
import com.veturnos.backend.enums.EstadoReserva;
import com.veturnos.backend.model.Cliente;
import com.veturnos.backend.model.Mascota;
import com.veturnos.backend.model.Reserva;
import com.veturnos.backend.repository.ClienteRepository;
import com.veturnos.backend.repository.MascotaRepository;
import com.veturnos.backend.repository.ReservaRepository;
import com.veturnos.backend.repository.VeterinarioRepository;
import com.veturnos.backend.service.RecargoConfirmacionRequeridaException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservaService {

    private static final Logger log = LoggerFactory.getLogger(ReservaService.class);
    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final MascotaRepository mascotaRepository;
    private final VeterinarioRepository veterinarioRepository;

    public ReservaService(ReservaRepository reservaRepository, ClienteRepository clienteRepository,
                          MascotaRepository mascotaRepository, VeterinarioRepository veterinarioRepository) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.mascotaRepository = mascotaRepository;
        this.veterinarioRepository = veterinarioRepository;
    }

    @Transactional
    public ReservaResponse reservarTurno(ReservaRequest request) {
        // 1. Calcular el fin del nuevo turno según su duración
        int duracion = request.getDuracionMinutos() != null ? request.getDuracionMinutos() : 30;
        LocalDateTime fechaHoraFin = request.getFechaHora().plusMinutes(duracion);

        // 2. Validar solapamiento de rangos en la agenda.
        // Aislado por veterinarioId: si el turno tiene un profesional asignado
        // (ej. el vet cargando una cirugía multibloque), el choque de horarios
        // solo se evalúa contra SU propia agenda, para no bloquear la agenda
        // de otro veterinario que trabaja en paralelo. Si no viene
        // veterinarioId (turno sin asignar todavía), se mantiene la
        // validación global.
        boolean seSolapa = reservaRepository.existeSolapamiento(
                request.getFechaHora(), fechaHoraFin, EstadoReserva.CANCELADO, request.getVeterinarioId());
        if (seSolapa) {
            String mensajeSolapamiento = request.getVeterinarioId() != null
                    ? "El rango horario seleccionado se solapa con otro turno en la agenda de ese veterinario"
                    : "El rango horario seleccionado se solapa con un turno existente";
            throw new IllegalArgumentException(mensajeSolapamiento);
        }

        // 3. Buscar Entidades
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new IllegalArgumentException("El cliente especificado no existe"));

        Mascota mascota = mascotaRepository.findById(request.getMascotaId())
                .orElseThrow(() -> new IllegalArgumentException("La mascota especificada no existe"));

        if (!mascota.getDueño().getId().equals(cliente.getId())) {
            throw new IllegalArgumentException("La mascota especificada no pertenece al cliente indicado");
        }

        // 4. Guardar un ÚNICO registro con su duración real
        Reserva nuevaReserva = new Reserva(mascota, cliente, request.getFechaHora(), duracion);

        if (request.getVeterinarioId() != null) {
            veterinarioRepository.findById(request.getVeterinarioId())
                    .ifPresent(nuevaReserva::setVeterinario);
        }

        Reserva reservaGuardada = reservaRepository.save(nuevaReserva);

        return mapperAResponse(reservaGuardada);
    }

    @Transactional(noRollbackFor = IllegalStateException.class)
    public void cancelarReserva(Long id, boolean confirmarRecargo) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La reserva no existe"));

        if (reserva.getEstado() == EstadoReserva.CANCELADO) {
            throw new IllegalArgumentException("La reserva ya se encuentra cancelada");
        }

        boolean requiereRecargo = reserva.requiereRecargoPorCancelacion();

        // AC 02: si está en ventana de recargo y el cliente todavía no confirmó,
        // cortamos ACÁ. Todavía no se tocó la base de datos.
        if (requiereRecargo && !confirmarRecargo) {
            throw new RecargoConfirmacionRequeridaException(
                    "Esta cancelación se considera tardía (faltan menos de 24hs) y aplicará un recargo. ¿Deseás continuar?"
            );
        }

        // Recién acá persistimos: o no requería recargo, o el cliente ya confirmó
        reserva.cancelar();
        reservaRepository.save(reserva);

        if (requiereRecargo) {
            // Ya fue confirmado; avisamos igual que se aplicó el recargo (para el toast)
            throw new IllegalStateException("La reserva fue cancelada. Se aplicará un recargo por cancelación tardía.");
        }
    }

    /**
     * Funcionalidad 1: cada 15 minutos, revisa los turnos que seguían
     * PENDIENTE con la hora de atención ya vencida y los pasa a AUSENTE.
     * No toca turnos ASISTIDO/COMPLETADO/CANCELADO.
     */
    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void marcarAusentesAutomaticamente() {
        log.info(">>> JOB marcarAusentesAutomaticamente EJECUTADO a las {}", LocalDateTime.now());

        List<Reserva> vencidos = reservaRepository.findVencidosPorEstado(
                EstadoReserva.PENDIENTE, LocalDateTime.now());

        log.info(">>> Encontrados {} turno(s) vencidos", vencidos.size());

        if (vencidos.isEmpty()) {
            return;
        }

        for (Reserva reserva : vencidos) {
            log.info(">>> Marcando AUSENTE: id={}, fechaHora={}, estado={}",
                    reserva.getId(), reserva.getFechaHora(), reserva.getEstado());
            reserva.marcarComoAusente();
        }
        reservaRepository.saveAll(vencidos);

        log.info(">>> Se marcaron {} turno(s) como AUSENTE automáticamente", vencidos.size());
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> obtenerAgendaDelDia(LocalDate fecha, Long sedeId, Long veterinarioId) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);

        // Usamos la nueva consulta que contempla turnos cruzados entre días,
        // con filtro opcional por sede y por veterinario (null = sin filtrar)
        List<Reserva> reservas = reservaRepository.findReservasDelDia(inicio, fin, sedeId, veterinarioId);

        return reservas.stream()
                .map(this::mapperAResponse)
                .collect(Collectors.toList());
    }

    // Disponibilidad para el cliente (RF: reserva de turnos): solo horarios futuros
    // y filtrados por sede. Distinto de obtenerAgendaDelDia (usado por vet/gestor).
    @Transactional(readOnly = true)
    public List<ReservaResponse> obtenerDisponibilidad(LocalDate fecha, Long sedeId, Long veterinarioId) { // 🟢 Agregá esto acá
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);
        LocalDateTime ahora = LocalDateTime.now();

        // Ahora sí machean los 5 parámetros que le mandás al Repository
        List<Reserva> reservas = reservaRepository.findDisponibilidad(inicio, fin, ahora, sedeId, veterinarioId);

        return reservas.stream()
                .map(this::mapperAResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservaResponse registrarAsistencia(Long id, String nuevoEstado, Long veterinarioId) {
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
            // Si se provee veterinarioId y la reserva no tiene vet asignado, asignarlo
            if (veterinarioId != null && reserva.getVeterinario() == null) {
                veterinarioRepository.findById(veterinarioId).ifPresent(reserva::setVeterinario);
            }
        } else if (estadoEnum == EstadoReserva.COMPLETADO) {
            reserva.completar();
        } else if (estadoEnum == EstadoReserva.PENDIENTE) {
            reserva.resetearAPendiente();
        } else {
            throw new IllegalArgumentException("Operación no permitida para este flujo de asistencia");
        }

        return mapperAResponse(reservaRepository.save(reserva));
    }

    @Transactional
    public ReservaResponse registrarObservaciones(Long id, String observaciones) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La reserva no existe"));

        reserva.registrarObservaciones(observaciones);

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
                reserva.getObservacionesClinicas(),
                reserva.getVeterinario() != null ? reserva.getVeterinario().getId() : null
        );
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> obtenerAgendaPorVeterinario(Long veterinarioId) {
        List<Reserva> reservas = reservaRepository.findByVeterinarioId(veterinarioId);
        return reservas.stream()
                .map(this::mapperAResponse)
                .collect(Collectors.toList());
    }

    // Punto 6: próximos turnos pendientes de un veterinario, sin importar el día
    @Transactional(readOnly = true)
    public List<ReservaResponse> obtenerProximosTurnosVeterinario(Long veterinarioId) {
        List<Reserva> reservas = reservaRepository.findByVeterinarioIdAndEstadoAndFechaHoraAfterOrderByFechaHoraAsc(
                veterinarioId, EstadoReserva.PENDIENTE, LocalDateTime.now());
        return reservas.stream()
                .map(this::mapperAResponse)
                .collect(Collectors.toList());
    }

    // RF-11 / RF-18: Dashboard de estadísticas — total general, por sede y por
    // veterinario, todo sobre el mismo criterio de "turno atendido" (ASISTIDO o
    // COMPLETADO, ver nota en contarTurnosPorSede).
    @Transactional(readOnly = true)
    public EstadisticasResponse obtenerEstadisticas() {
        List<EstadoReserva> estadosAtendidos = List.of(EstadoReserva.ASISTIDO, EstadoReserva.COMPLETADO);

        long totalTurnos = reservaRepository.contarTurnosTotal(estadosAtendidos);
        List<MetricaSedeDTO> porSede = reservaRepository.contarTurnosPorSede(estadosAtendidos);
        List<MetricaVeterinarioDTO> porVeterinario = reservaRepository.contarTurnosPorVeterinario(estadosAtendidos);

        return new EstadisticasResponse(totalTurnos, porSede, porVeterinario);
    }

    // Búsqueda Global de Pacientes: historial clínico completo de una mascota,
    // sin importar la sede o el veterinario que la atendió, en orden cronológico
    @Transactional(readOnly = true)
    public List<HistorialClinicoResponse> obtenerHistorialClinico(Long mascotaId) {
        if (!mascotaRepository.existsById(mascotaId)) {
            throw new IllegalArgumentException("La mascota especificada no existe");
        }

        List<Reserva> reservas = reservaRepository.findByMascotaIdAndEstadoInOrderByFechaHoraAsc(
                mascotaId, List.of(EstadoReserva.ASISTIDO, EstadoReserva.COMPLETADO));

        return reservas.stream()
                .map(this::mapperAHistorial)
                .collect(Collectors.toList());
    }

    private HistorialClinicoResponse mapperAHistorial(Reserva reserva) {
        String nombreVeterinario = reserva.getVeterinario() != null
                ? reserva.getVeterinario().getNombreCompleto()
                : null;
        String nombreSede = (reserva.getVeterinario() != null && reserva.getVeterinario().getSede() != null)
                ? reserva.getVeterinario().getSede().getNombre()
                : null;

        return new HistorialClinicoResponse(
                reserva.getId(),
                reserva.getFechaHora(),
                nombreVeterinario,
                nombreSede,
                reserva.getObservacionesClinicas()
        );
    }
}