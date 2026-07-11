// MetricaVeterinarioDTO.java
package com.veturnos.backend.dto;

public class MetricaVeterinarioDTO {

    private String nombreVeterinario;
    private Long cantidadTurnos;

    public MetricaVeterinarioDTO(String nombreVeterinario, Long cantidadTurnos) {
        this.nombreVeterinario = nombreVeterinario;
        this.cantidadTurnos = cantidadTurnos;
    }

    public String getNombreVeterinario() { return nombreVeterinario; }
    public Long getCantidadTurnos() { return cantidadTurnos; }
}
