// Reserva.java (Actualizado para Entrega 2)

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

    // 🚀 E2: Relación ManyToOne con Veterinario para admitir múltiples agendas independientes
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinario_id", nullable = false)
    private Veterinario veterinario;

    @Column(nullable = false)
    private LocalDateTime fechaHora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoReserva estado;

    private Integer duracionMinutos;

    // 🚀 E2: Campo de observaciones persistente para asentar la evolución clínica (Ficha Médica)
    @Column(columnDefinition = "TEXT")
    private String observaciones;

    private String motivo; // Guardará el motivo de la consulta (ej. CIRUGIA, CONSULTA_GENERAL)

    public Reserva() {}

    // 🚀 E2: Constructor actualizado con Veterinario y Motivo
    public Reserva(Mascota mascota, Cliente cliente, Veterinario veterinario, LocalDateTime fechaHora, Integer duracionMinutos, String motivo) {
        if (mascota == null) {
            throw new IllegalArgumentException("Debe especificar una mascota");
        }
        if (cliente == null) {
            throw new IllegalArgumentException("Debe especificar un cliente");
        }
        if (veterinario == null) {
            throw new IllegalArgumentException("Debe especificar un veterinario");
        }
        if (fechaHora == null || fechaHora.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("La fecha del turno debe ser futura");
        }

        this.mascota = mascota;
        this.cliente = cliente;
        this.veterinario = veterinario;
        this.fechaHora = fechaHora;
        this.duracionMinutos = (duracionMinutos != null) ? duracionMinutos : 30; // 30 por defecto
        this.motivo = (motivo != null && !motivo.trim().isEmpty()) ? motivo : "CONSULTA_GENERAL";
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
        if (this.estado != EstadoReserva.ASISTIDO && this.estado != EstadoReserva.PENDIENTE) {
            throw new IllegalStateException("Solo se pueden completar turnos que fueron asistidos o estan pendientes");
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

    // Getters y Setters
    public Long getId() { return id; }
    
    public Mascota getMascota() { return mascota; }
    public void setMascota(Mascota mascota) { this.mascota = mascota; }
    
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public Veterinario getVeterinario() { return veterinario; }
    public void setVeterinario(Veterinario veterinario) { this.veterinario = veterinario; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
    
    public EstadoReserva getEstado() { return estado; }
    public void setEstado(EstadoReserva estado) { this.estado = estado; }
    
    public Integer getDuracionMinutos() { return duracionMinutos; }
    public void setDuracionMinutos(Integer duracionMinutos) { this.duracionMinutos = duracionMinutos; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}