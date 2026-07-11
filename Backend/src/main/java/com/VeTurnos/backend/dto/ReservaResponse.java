// ReservaResponse.java
package com.veturnos.backend.dto;

import java.time.LocalDateTime;

public class ReservaResponse {
    private Long id;
    private String nombreCliente;
    private String nombreMascota;
    private LocalDateTime fechaHora;
    private String estado;
    private Integer duracionMinutos;
    private String observacionesClinicas;
    private Long veterinarioId; // null si el turno todavía no tiene veterinario asignado

    public ReservaResponse(Long id, String nombreCliente, String nombreMascota, LocalDateTime fechaHora,
                            String estado, Integer duracionMinutos, String observacionesClinicas,
                            Long veterinarioId) {
        this.id = id;
        this.nombreCliente = nombreCliente;
        this.nombreMascota = nombreMascota;
        this.fechaHora = fechaHora;
        this.estado = estado;
        this.duracionMinutos = duracionMinutos;
        this.observacionesClinicas = observacionesClinicas;
        this.veterinarioId = veterinarioId;
    }

    // Getters
    public Long getId() { return id; }
    public String getNombreCliente() { return nombreCliente; }
    public String getNombreMascota() { return nombreMascota; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public String getEstado() { return estado; }
    public Integer getDuracionMinutos() { return duracionMinutos; }
    public String getObservacionesClinicas() { return observacionesClinicas; }
    public Long getVeterinarioId() { return veterinarioId; }
}