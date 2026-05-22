package com.veturnos.backend.service;

import com.veturnos.backend.dto.ReservaRequest;
import com.veturnos.backend.dto.ReservaResponse;
import com.veturnos.backend.enums.EstadoReserva;
import com.veturnos.backend.model.Cliente;
import com.veturnos.backend.model.Mascota;
import com.veturnos.backend.model.Reserva;
import com.veturnos.backend.repository.ClienteRepository;
import com.veturnos.backend.repository.MascotaRepository;
import com.veturnos.backend.repository.ReservaRepository;
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
        // 1. Validar solapamiento de agenda (US-03 AC 02)
        boolean horarioOcupado = reservaRepository.existsByFechaHoraAndEstadoNot(request.getFechaHora(), EstadoReserva.CANCELADO);
        if (horarioOcupado) {
            throw new IllegalArgumentException("El horario seleccionado ya no se encuentra disponible");
        }

        // 2. Buscar Entidades
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new IllegalArgumentException("El cliente especificado no existe"));

        Mascota mascota = mascotaRepository.findById(request.getMascotaId())
                .orElseThrow(() -> new IllegalArgumentException("La mascota especificada no existe"));

        // 3. Validar que la mascota pertenezca al cliente real
        if (!mascota.getDueño().getId().equals(cliente.getId())) {
            throw new IllegalArgumentException("La mascota especificada no pertenece al cliente indicado");
        }

        // 4. Instanciar Dominio y Guardar (Nace en PENDIENTE por constructor)
        Reserva nuevaReserva = new Reserva(mascota, cliente, request.getFechaHora());
        Reserva reservaGuardada = reservaRepository.save(nuevaReserva);

        return mapperAResponse(reservaGuardada);
    }

    @Transactional
    public void cancelarReserva(Long id) {
        Reserva reserva = reservaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La reserva no existe"));

        // Evalúa la regla de las 24 horas usando el método del dominio
        boolean requiereRecargo = reserva.requiereRecargoPorCancelacion();

        // Ejecuta la transición de estado lógica del dominio
        reserva.cancelar();
        reservaRepository.save(reserva);

        // Si es tardía, avisamos lanzando la excepción específica para que el Controller lo exponga
        if (requiereRecargo) {
            throw new IllegalStateException("Se cobrará un recargo por cancelación tardía debido a que faltan menos de 24 horas para la consulta");
        }
    }

    @Transactional(readOnly = true)
    public List<ReservaResponse> obtenerAgendaDelDia(LocalDate fecha) {
        // Calcula extremos 00:00:00 y 23:59:59.999999 (US-05 AC 01)
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);

        List<Reserva> reservas = reservaRepository.findByFechaHoraBetween(inicio, fin);

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
                reserva.getEstado().name()
        );
    }
}