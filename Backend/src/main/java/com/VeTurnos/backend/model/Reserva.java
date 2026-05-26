// Reserva.java

package com.veturnos.backend.model;

import com.veturnos.backend.enums.EstadoReserva;
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

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoReserva estado;

    private Integer duracionMinutos;

    public Reserva() {}

    public Reserva(Mascota mascota, Cliente cliente, LocalDateTime fechaHora, Integer duracionMinutos) {
        if (mascota == null) {
            throw new IllegalArgumentException("Debe especificar una mascota");
        }
        if (cliente == null) {
            throw new IllegalArgumentException("Debe especificar un cliente");
        }
        if (fechaHora == null || fechaHora.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("La fecha del turno debe ser futura");
        }

        this.mascota = mascota;
        this.cliente = cliente;
        this.fechaHora = fechaHora;
        this.duracionMinutos = (duracionMinutos != null) ? duracionMinutos : 30; // 30 por defecto
        this.estado = EstadoReserva.PENDIENTE;
    }

// No se puede asistir si esta cancelado
    public void marcarComoAsistido() {
        if (this.estado == EstadoReserva.CANCELADO) {
            throw new IllegalStateException("No se puede marcar como asistido un turno cancelado");
        }
        this.estado = EstadoReserva.ASISTIDO;
    }

// No se puede completar si no esta en estado asistido
    public void completar() {
        if (this.estado != EstadoReserva.ASISTIDO) {
            throw new IllegalStateException("Solo se pueden completar turnos que fueron asistidos");
        }
        this.estado = EstadoReserva.COMPLETADO;
    }

// Penalizacion por cancelacion 24 horas antes del turno
    public boolean requiereRecargoPorCancelacion() {
        return LocalDateTime.now().isAfter(this.fechaHora.minusHours(24));
    }

// Cancelar turnos incompletos o sin ya haber sido cancelados
    public void cancelar() {

        if (this.estado == EstadoReserva.CANCELADO) {
            throw new IllegalStateException("El turno ya se encuentra cancelado");
        }
        if (this.estado == EstadoReserva.COMPLETADO) {
            throw new IllegalStateException("No se puede cancelar un turno ya completado");
        }
        this.estado = EstadoReserva.CANCELADO;
    }

// Getters
    public Long getId() { return id; }
    public Mascota getMascota() { return mascota; }
    public Cliente getCliente() { return cliente; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public EstadoReserva getEstado() { return estado; }
    public Integer getDuracionMinutos() { return duracionMinutos; }
} 