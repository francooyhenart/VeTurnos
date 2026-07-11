package com.veturnos.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Vinculamos la notificación directamente al cliente que debe recibirla
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, columnDefinition = "text")
    private String mensaje;

    @Column(nullable = false)
    private LocalDateTime fechaHoraCreacion;

    @Column(nullable = false)
    private boolean leido;

    public Notificacion() {}

    public Notificacion(Usuario usuario, String titulo, String mensaje) {
        this.usuario = usuario;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.fechaHoraCreacion = LocalDateTime.now();
        this.leido = false; // Por defecto arranca sin leer
    }

    // Lógica para marcar como leída desde la app
    public void marcarComoLeida() {
        this.leido = true;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getMensaje() { return mensaje; }
    public void setString(String mensaje) { this.mensaje = mensaje; }
    public LocalDateTime getFechaHoraCreacion() { return fechaHoraCreacion; }
    public boolean isLeido() { return leido; }
}