package com.VeTurnos.backend.service;

import com.VeTurnos.backend.dto.ReservaRequest;
import com.VeTurnos.backend.dto.ReservaResponse;
import com.VeTurnos.backend.enums.EstadoReserva;
import com.VeTurnos.backend.model.Cliente;
import com.VeTurnos.backend.model.Mascota;
import com.VeTurnos.backend.model.Reserva;
import com.VeTurnos.backend.repository.ClienteRepository;
import com.VeTurnos.backend.repository.MascotaRepository;
import com.VeTurnos.backend.repository.ReservaRepository;
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

    public ReservaService(ReservaRepository reservaRepository, ClienteRepository clienteRepository, MascotaRepository mascotaRepository) {
        this.reservaRepository = reservaRepository;
        this.clienteRepository = clienteRepository;
        this.mascotaRepository = mascotaRepository;
    }

    @Transactional
    public ReservaResponse reservarTurno(ReservaRequest request) {
        // 1. Calcular el fin del nuevo turno según su duración
        int duracion = request.getDuracionMinutos() != null ? request.getDuracionMinutos() : 30;
        LocalDateTime fechaHoraFin = request.getFechaHora().plusMinutes(duracion);

        // 2. Validar solapamiento de rangos en la agenda
        boolean seSolapa = reservaRepository.existeSolapamiento(request.getFechaHora(), fechaHoraFin, EstadoReserva.CANCELADO);
        if (seSolapa) {
            throw new IllegalArgumentException("El rango horario seleccionado se solapa con un turno existente");
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
        Reserva reservaGuardada = reservaRepository.save(nuevaReserva);

        return mapperAResponse(reservaGuardada);
    }

    @Transactional(noRollbackFor = IllegalStateException.class)
    public void cancelarReserva(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La reserva no existe"));

        boolean requiereRecargo = reserva.requiereRecargoPorCancelacion();

        // Al ser una sola fila, esto cancela el bloque completo de una
        reserva.cancelar();
        reservaRepository.save(reserva);

        if (requiereRecargo) {
            throw new IllegalStateException("Se cobrará un recargo por cancelación tardía debido a que faltan menos de 24 horas para la consulta");
        }
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> obtenerAgendaDelDia(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);

        // Usamos la nueva consulta que contempla turnos cruzados entre días
        List<Reserva> reservas = reservaRepository.findReservasDelDia(inicio, fin);

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

        // Conmutación segura usando las reglas de negocio de tu entidad de dominio
        if (estadoEnum == EstadoReserva.ASISTIDO) {
            reserva.marcarComoAsistido();
        } else if (estadoEnum == EstadoReserva.COMPLETADO) {
            reserva.completar();
        } else {
            throw new IllegalArgumentException("Operación no permitida para este flujo de asistencia");
        }

        return mapperAResponse(reservaRepository.save(reserva));
    }

    private ReservaResponse mapperAResponse(Reserva reserva) {
        return new ReservaResponse(
                reserva.getId(),
                reserva.getCliente().getNombreCompleto(),
                reserva.getMascota().getNombre(),
                reserva.getFechaHora(),
                reserva.getEstado().name(),
                reserva.getDuracionMinutos()
        );
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> obtenerAgendaPorVeterinario(Long veterinarioId) {
        List<Reserva> reservas = reservaRepository.findByVeterinarioId(veterinarioId);
        return reservas.stream()
                .map(this::mapperAResponse)
                .collect(Collectors.toList());
    }
}