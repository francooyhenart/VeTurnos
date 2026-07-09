// MetricasController.java
package com.VeTurnos.backend.controller;

import com.VeTurnos.backend.dto.EstadisticasResponse;
import com.VeTurnos.backend.service.ReservaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/metricas")
public class MetricasController {

    private final ReservaService reservaService;

    public MetricasController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    /**
     * RF-11 / RF-18: Dashboard de estadísticas del Manager — total general de
     * turnos atendidos, desglosados por sede y por veterinario.
     * GET /api/metricas/estadisticas
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            EstadisticasResponse estadisticas = reservaService.obtenerEstadisticas();
            return new ResponseEntity<>(estadisticas, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al obtener las estadísticas");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
