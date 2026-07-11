// SedeController.java

package com.veturnos.backend.controller;

import com.veturnos.backend.dto.SedeRequest;
import com.veturnos.backend.dto.SedeResponse;
import com.veturnos.backend.model.Sede;
import com.veturnos.backend.service.SedeService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sedes")
public class SedeController {

    private final SedeService sedeService;
    private final Logger logger = LoggerFactory.getLogger(SedeController.class);

    public SedeController(SedeService sedeService) {
        this.sedeService = sedeService;
    }

    /**
     * CREATE - Crear nueva sede
     * POST /api/sedes
     */
    @PostMapping
    public ResponseEntity<?> crearSede(@Valid @RequestBody SedeRequest request) {
        try {
            Sede sede = sedeService.crearSede(
                request.getNombre(),
                request.getCalle(),
                request.getNumero(),
                request.getEntreCalles()
            );
            return new ResponseEntity<>(convertirAResponse(sede), HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Error al crear la sede: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al crear la sede: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * READ - Obtener todas las sedes
     * GET /api/sedes
     */
    @GetMapping
    public ResponseEntity<?> obtenerTodas() {
        try {
            List<SedeResponse> respuesta = sedeService.obtenerTodas()
                .stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
            return new ResponseEntity<>(respuesta, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al obtener las sedes: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al obtener las sedes: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE - Eliminar sede (Punto 4).
     * No se permite si tiene turnos asignados.
     * DELETE /api/sedes/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarSede(@PathVariable Long id) {
        try {
            sedeService.eliminarSede(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Sede eliminada exitosamente");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // Salvaguarda: veterinarios con esta sede asignada (aunque sin turnos) también impiden el delete físico
            logger.error("Error de integridad al eliminar la sede {}: ", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "No se puede eliminar la sede porque tiene veterinarios o turnos asociados");
            return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
        } catch (Exception e) {
            logger.error("Error al eliminar la sede {}: ", id, e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al eliminar la sede: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private SedeResponse convertirAResponse(Sede sede) {
        return new SedeResponse(
            sede.getId(),
            sede.getNombre(),
            sede.getCalle(),
            sede.getNumero(),
            sede.getEntreCalles(),
            sede.getDireccionCompleta()
        );
    }
}
