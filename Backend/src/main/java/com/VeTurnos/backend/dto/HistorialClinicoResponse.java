// HistorialClinicoResponse.java
package com.veturnos.backend.dto;

import java.time.LocalDateTime;

public class HistorialClinicoResponse {

    private Long id;
    private LocalDateTime fechaHora;
    private String nombreVeterinario; // null si el turno no tenía veterinario asignado
    private String nombreSede;        // null si el veterinario no tenía sede asignada
    private String observacionesClinicas;

    public HistorialClinicoResponse(Long id, LocalDateTime fechaHora, String nombreVeterinario,
                                     String nombreSede, String observacionesClinicas) {
        this.id = id;
        this.fechaHora = fechaHora;
        this.nombreVeterinario = nombreVeterinario;
        this.nombreSede = nombreSede;
        this.observacionesClinicas = observacionesClinicas;
    }

    public Long getId() { return id; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public String getNombreVeterinario() { return nombreVeterinario; }
    public String getNombreSede() { return nombreSede; }
    public String getObservacionesClinicas() { return observacionesClinicas; }
}
