package com.veturnos.backend.service;

import com.veturnos.backend.enums.EstadoReserva;
import com.veturnos.backend.model.Reserva;
import com.veturnos.backend.repository.ReservaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class NotificacionScheduler {

    private static final Logger log = LoggerFactory.getLogger(NotificacionScheduler.class);
    private final ReservaRepository reservaRepository;
    private final NotificacionService notificacionService;

    public NotificacionScheduler(ReservaRepository reservaRepository, NotificacionService notificacionService) {
        this.reservaRepository = reservaRepository;
        this.notificacionService = notificacionService;
    }

    /**
     * Se ejecuta de fondo cada 15 minutos.
     * Escanea turnos que arranquen en 24 horas y en 3 horas.
     */
    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void procesarRecordatoriosDeTurnos() {
        LocalDateTime ahora = LocalDateTime.now();
        DateTimeFormatter formatoHora = DateTimeFormatter.ofPattern("HH:mm");

        // ─── 1. VENTANA DE 24 HORAS ─────────────────────────────────────────
        // Buscamos turnos que arranquen entre dentro de 24hs y 24hs con 15 min
        LocalDateTime inicio24h = ahora.plusHours(24).minusMinutes(5);
        LocalDateTime fin24h = ahora.plusHours(24).plusMinutes(15);

        List<Reserva> turnos24h = reservaRepository.findByEstadoAndFechaHoraBetween(
                EstadoReserva.PENDIENTE, inicio24h, fin24h);

        for (Reserva reserva : turnos24h) {
            String titulo = "⏰ Recordatorio de Turno (24hs)";
            String mensaje = "Te recordamos que mañana a las " + reserva.getFechaHora().format(formatoHora) +
                    "hs tenés un turno programado para tu mascota " + reserva.getMascota().getNombre() + ".";

            // Evitamos duplicar si el scheduler pasa dos veces por la misma ventana
            boolean yaNotificado = reservaRepository.existeNotificacionDuplicada(
                    reserva.getCliente().getId(), titulo, reserva.getMascota().getNombre());

            if (!yaNotificado) {
                notificacionService.crearNotificacionInterna(reserva.getCliente().getId(), titulo, mensaje);
                log.info("Notificación de 24hs generada para el cliente ID: {}", reserva.getCliente().getId());
            }
        }

        // ─── 2. VENTANA DE 4 HORAS (Modificado a pedido de Franco) ───────
        // Buscamos turnos que arranquen entre dentro de 4hs y 4hs con 15 min
        LocalDateTime inicio4h = ahora.plusHours(4);
        LocalDateTime fin4h = ahora.plusHours(4).plusMinutes(15);

        List<Reserva> turnos4h = reservaRepository.findByEstadoAndFechaHoraBetween(
                EstadoReserva.PENDIENTE, inicio4h, fin4h);

        for (Reserva reserva : turnos4h) {
            String titulo = "🚨 ¡Tu turno es hoy! (4hs)";
            String mensaje = "Te avisamos que faltan solo 4 horas para el turno de " + reserva.getMascota().getNombre() +
                    " a las " + reserva.getFechaHora().format(formatoHora) + "hs. ¡No te olvides!";

            boolean yaNotificado = reservaRepository.existeNotificacionDuplicada(
                    reserva.getCliente().getId(), titulo, reserva.getMascota().getNombre());

            if (!yaNotificado) {
                notificacionService.crearNotificacionInterna(reserva.getCliente().getId(), titulo, mensaje);
                log.info("Notificación de 4hs generada para el cliente ID: {}", reserva.getCliente().getId());
            }
        }
    }
}