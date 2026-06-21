package com.veturnos.backend.dto;

import java.time.LocalDateTime;

public class ReservaResponse {
    private Long id;
    private String nombreCliente;
    private String nombreMascota;
    private LocalDateTime fechaHora;
    private String estado;
    private Integer duracionMinutos;
    private String observaciones; // 🚀 E2: Agregado para exponer el diagnóstico clínico e historial
    private String motivo;        // 🚀 E2: Agregado para exponer la razón del turno (ej. Cirugía)

    // 🚀 Constructor actualizado para la Entrega 2
    public ReservaResponse(Long id, String nombreCliente, String nombreMascota, LocalDateTime fechaHora, 
                           String estado, Integer duracionMinutos, String observaciones, String motivo) {
        this.id = id;
        this.nombreCliente = nombreCliente;
        this.nombreMascota = nombreMascota;
        this.fechaHora = fechaHora;
        this.estado = estado;
        this.duracionMinutos = duracionMinutos;
        this.observaciones = observaciones;
        this.motivo = motivo;
    }

    // Getters
    public Long getId() { return id; }
    public String getNombreCliente() { return nombreCliente; }
    public String getNombreMascota() { return nombreMascota; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public String getEstado() { return estado; }
    public Integer getDuracionMinutos() { return duracionMinutos; }
    public String getObservaciones() { return observaciones; }
    public String getMotivo() { return motivo; }
}