package com.VeTurnos.backend.model;

import com.VeTurnos.backend.enums.EstadoReserva;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mascota_id", nullable = false)
    private Mascota mascota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinario_id", nullable = true)
    @JsonIgnore // <-- ESTA ANOTACIÓN EVITA EL BUCLE INFINITO
    private Veterinario veterinario;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoReserva estado;

    private Integer duracionMinutos;

    public Reserva() {}

    public Reserva(Mascota mascota, Cliente cliente, LocalDateTime fechaHora, Integer duracionMinutos) {
        if (mascota == null) throw new IllegalArgumentException("Debe especificar una mascota");
        if (cliente == null) throw new IllegalArgumentException("Debe especificar un cliente");
        if (fechaHora == null || fechaHora.isBefore(LocalDateTime.now())) throw new IllegalArgumentException("La fecha del turno debe ser futura");

        this.mascota = mascota;
        this.cliente = cliente;
        this.fechaHora = fechaHora;
        this.duracionMinutos = (duracionMinutos != null) ? duracionMinutos : 30;
        this.estado = EstadoReserva.PENDIENTE;
    }

    public void marcarComoAsistido() {
        if (this.estado == EstadoReserva.CANCELADO) throw new IllegalStateException("No se puede marcar como asistido un turno cancelado");
        this.estado = EstadoReserva.ASISTIDO;
    }

    public void completar() {
        if (this.estado != EstadoReserva.ASISTIDO) throw new IllegalStateException("Solo se pueden completar turnos que fueron asistidos");
        this.estado = EstadoReserva.COMPLETADO;
    }

    public boolean requiereRecargoPorCancelacion() {
        return LocalDateTime.now().isAfter(this.fechaHora.minusHours(24));
    }

    public void cancelar() {
        if (this.estado == EstadoReserva.CANCELADO) throw new IllegalStateException("El turno ya se encuentra cancelado");
        if (this.estado == EstadoReserva.COMPLETADO) throw new IllegalStateException("No se puede cancelar un turno ya completado");
        this.estado = EstadoReserva.CANCELADO;
    }

    public void resetearAPendiente() {
        if (this.estado == EstadoReserva.COMPLETADO) throw new IllegalStateException("No se puede desconfirmar un turno ya completado");
        if (this.estado == EstadoReserva.CANCELADO) throw new IllegalStateException("No se puede modificar un turno cancelado");
        this.estado = EstadoReserva.PENDIENTE;
    }

    public Long getId() { return id; }
    public Mascota getMascota() { return mascota; }
    public Cliente getCliente() { return cliente; }
    public Veterinario getVeterinario() { return veterinario; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public EstadoReserva getEstado() { return estado; }
    public Integer getDuracionMinutos() { return duracionMinutos; }
    public void setVeterinario(Veterinario veterinario) { this.veterinario = veterinario; }
}