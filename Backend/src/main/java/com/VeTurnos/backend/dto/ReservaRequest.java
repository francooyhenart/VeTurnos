package com.veturnos.backend.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class ReservaRequest {

    @NotNull(message = "El ID de la mascota es obligatorio")
    private Long mascotaId;

    @NotNull(message = "El ID del cliente es obligatorio")
    private Long clienteId;

    // 🚀 E2: ID del profesional médico obligatorio para la expansión horizontal de agendas
    @NotNull(message = "El ID del veterinario es obligatorio")
    private Long veterinarioId;

    @NotNull(message = "La fecha y hora del turno son obligatorias")
    @Future(message = "La fecha del turno debe ser futura") // Cumple US-03 AC 03
    private LocalDateTime fechaHora;

    private Integer duracionMinutos;

    private String motivo; // 🚀 E2: Motivo de consulta (ej. CONSULTA_GENERAL, CIRUGIA)

    // Constructores
    public ReservaRequest() {}

    // Getters y Setters
    public Long getMascotaId() { return mascotaId; }
    public void setMascotaId(Long mascotaId) { this.mascotaId = mascotaId; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public Long getVeterinarioId() { return veterinarioId; }
    public void setVeterinarioId(Long veterinarioId) { this.veterinarioId = veterinarioId; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public Integer getDuracionMinutos() { return duracionMinutos; }
    public void setDuracionMinutos(Integer duracionMinutos) { this.duracionMinutos = duracionMinutos; }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }
}