// ReservaResponse.java
package com.VeTurnos.backend.dto;

import java.time.LocalDateTime;

public class ReservaResponse {
    private Long id;
    private String nombreCliente;
    private String nombreMascota;
    private LocalDateTime fechaHora;
    private String estado;
    private Integer duracionMinutos;

    public ReservaResponse(Long id, String nombreCliente, String nombreMascota, LocalDateTime fechaHora, String estado, Integer duracionMinutos) {
        this.id = id;
        this.nombreCliente = nombreCliente;
        this.nombreMascota = nombreMascota;
        this.fechaHora = fechaHora;
        this.estado = estado;
        this.duracionMinutos = duracionMinutos;
    }

    // Getters
    public Long getId() { return id; }
    public String getNombreCliente() { return nombreCliente; }
    public String getNombreMascota() { return nombreMascota; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public String getEstado() { return estado; }
    public Integer getDuracionMinutos() { return duracionMinutos; }
}