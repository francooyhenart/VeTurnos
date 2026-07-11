package com.veturnos.backend.dto;

import java.time.LocalDateTime;

public class NotificacionResponse {
    private Long id;
    private Long usuarioId;
    private String titulo;
    private String mensaje;
    private LocalDateTime fechaHoraCreacion;
    private boolean leido;

    public NotificacionResponse(Long id, Long usuarioId, String titulo, String mensaje,
                                LocalDateTime fechaHoraCreacion, boolean leido) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.fechaHoraCreacion = fechaHoraCreacion;
        this.leido = leido;
    }

    // Getters
    public Long getId() { return id; }
    public Long getUsuarioId() { return usuarioId; }
    public String getTitulo() { return titulo; }
    public String getMensaje() { return mensaje; }
    public LocalDateTime getFechaHoraCreacion() { return fechaHoraCreacion; }
    public boolean isLeido() { return leido; }
}