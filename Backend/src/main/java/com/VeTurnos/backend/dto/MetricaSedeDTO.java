// MetricaSedeDTO.java
package com.veturnos.backend.dto;

public class MetricaSedeDTO {

    private String nombreSede;
    private Long cantidadTurnos;

    public MetricaSedeDTO(String nombreSede, Long cantidadTurnos) {
        this.nombreSede = nombreSede;
        this.cantidadTurnos = cantidadTurnos;
    }

    public String getNombreSede() { return nombreSede; }
    public Long getCantidadTurnos() { return cantidadTurnos; }
}
