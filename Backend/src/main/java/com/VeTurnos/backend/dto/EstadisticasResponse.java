// EstadisticasResponse.java
package com.VeTurnos.backend.dto;

import java.util.List;

public class EstadisticasResponse {

    private long totalTurnos;
    private List<MetricaSedeDTO> porSede;
    private List<MetricaVeterinarioDTO> porVeterinario;

    public EstadisticasResponse(long totalTurnos, List<MetricaSedeDTO> porSede,
                                 List<MetricaVeterinarioDTO> porVeterinario) {
        this.totalTurnos = totalTurnos;
        this.porSede = porSede;
        this.porVeterinario = porVeterinario;
    }

    public long getTotalTurnos() { return totalTurnos; }
    public List<MetricaSedeDTO> getPorSede() { return porSede; }
    public List<MetricaVeterinarioDTO> getPorVeterinario() { return porVeterinario; }
}
