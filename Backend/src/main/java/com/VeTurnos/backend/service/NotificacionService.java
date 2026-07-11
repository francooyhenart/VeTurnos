package com.veturnos.backend.service;

import com.veturnos.backend.dto.NotificacionResponse;
import com.veturnos.backend.model.Notificacion;
import com.veturnos.backend.model.Usuario;
import com.veturnos.backend.repository.NotificacionRepository;
import com.veturnos.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public NotificacionService(NotificacionRepository notificacionRepository, UsuarioRepository usuarioRepository) {
        this.notificacionRepository = notificacionRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // 🟢 Consultar historial de la campanita
    @Transactional(readOnly = true)
    public List<NotificacionResponse> obtenerPorUsuario(Long usuarioId) {
        return notificacionRepository.findByUsuarioId(usuarioId).stream()
                .map(this::mapperAResponse)
                .collect(Collectors.toList());
    }

    // 🟢 Consultar contador de mensajes pendientes
    @Transactional(readOnly = true)
    public long obtenerCantidadSinLeer(Long usuarioId) {
        return notificacionRepository.countByUsuarioIdAndLeidoFalse(usuarioId);
    }

    // 🟢 Marcar como leída al clickear en la app
    @Transactional
    public NotificacionResponse marcarComoLeida(Long id) {
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("La notificación no existe"));

        notificacion.marcarComoLeida();
        return mapperAResponse(notificacionRepository.save(notificacion));
    }

    // 🟢 Método auxiliar (Helper) para crear alertas desde los schedulers de forma simple
    @Transactional
    public void crearNotificacionInterna(Long usuarioId, String titulo, String mensaje) {
        usuarioRepository.findById(usuarioId).ifPresent(usuario -> {
            Notificacion nueva = new Notificacion(usuario, titulo, mensaje);
            notificacionRepository.save(nueva);
        });
    }

    private NotificacionResponse mapperAResponse(Notificacion notificacion) {
        return new NotificacionResponse(
                notificacion.getId(),
                notificacion.getUsuario().getId(),
                notificacion.getTitulo(),
                notificacion.getMensaje(),
                notificacion.getFechaHoraCreacion(),
                notificacion.isLeido()
        );
    }
}