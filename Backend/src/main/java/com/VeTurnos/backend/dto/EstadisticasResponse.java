// EstadisticasResponse.java
package com.veturnos.backend.dto;

import java.util.List;

public class EstadisticasResponse {

    private long totalTurnos;
    private List<com.veturnos.backend.dto.MetricaSedeDTO> porSede;
    private List<com.veturnos.backend.dto.MetricaVeterinarioDTO> porVeterinario;

    public EstadisticasResponse(long totalTurnos, List<com.veturnos.backend.dto.MetricaSedeDTO> porSede,
                                 List<com.veturnos.backend.dto.MetricaVeterinarioDTO> porVeterinario) {
        this.totalTurnos = totalTurnos;
        this.porSede = porSede;
        this.porVeterinario = porVeterinario;
    }

    public long getTotalTurnos() { return totalTurnos; }
    public List<com.veturnos.backend.dto.MetricaSedeDTO> getPorSede() { return porSede; }
    public List<com.veturnos.backend.dto.MetricaVeterinarioDTO> getPorVeterinario() { return porVeterinario; }
}
