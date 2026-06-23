// GestorVeterinarioController.java

package com.VeTurnos.backend.controller;

import com.VeTurnos.backend.dto.VeterinarioRequest;
import com.VeTurnos.backend.dto.VeterinarioResponse;
import com.VeTurnos.backend.model.Veterinario;
import com.VeTurnos.backend.model.Reserva;
import com.VeTurnos.backend.service.GestorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/veterinarios")
public class GestorVeterinarioController {

    private final GestorService gestorService;
    private final Logger logger = LoggerFactory.getLogger(GestorVeterinarioController.class);

    public GestorVeterinarioController(GestorService gestorService) {
        this.gestorService = gestorService;
    }

    /**
     * CREATE - Crear nuevo veterinario
     * POST /api/admin/veterinarios
     */
    @PostMapping
    public ResponseEntity<?> crearVeterinario(@Valid @RequestBody VeterinarioRequest request) {
        try {
            Veterinario veterinario = gestorService.crearVeterinario(
                request.getNombreCompleto(),
                request.getDni(),
                request.getTelefono(),
                request.getEmail(),
                request.getPassword(),
                request.getMatricula(),
                request.getEspecialidad()
            );
            VeterinarioResponse response = convertirAResponse(veterinario);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al crear el veterinario");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * READ - Obtener todos los veterinarios
     * GET /api/admin/veterinarios
     */
    @GetMapping
    public ResponseEntity<?> obtenerTodos() {
        try {
            List<Veterinario> veterinarios = gestorService.obtenerTodosLosVeterinarios();
            List<VeterinarioResponse> respuesta = veterinarios
                .stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
            return new ResponseEntity<>(respuesta, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error al obtener veterinarios: ", e);
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al obtener los veterinarios: " + e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * READ - Obtener veterinario por ID
     * GET /api/admin/veterinarios/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            Veterinario veterinario = gestorService.obtenerVeterinarioPorId(id);
            VeterinarioResponse response = convertirAResponse(veterinario);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al obtener el veterinario");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * READ - Obtener veterinario por matrícula
     * GET /api/admin/veterinarios/matricula/{matricula}
     */
    @GetMapping("/matricula/{matricula}")
    public ResponseEntity<?> obtenerPorMatricula(@PathVariable String matricula) {
        try {
            Veterinario veterinario = gestorService.obtenerVeterinarioPorMatricula(matricula);
            VeterinarioResponse response = convertirAResponse(veterinario);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al obtener el veterinario");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * UPDATE - Actualizar datos del veterinario
     * PUT /api/admin/veterinarios/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarVeterinario(
            @PathVariable Long id,
            @Valid @RequestBody VeterinarioRequest request) {
        try {
            Veterinario veterinario = gestorService.actualizarVeterinario(
                id,
                request.getNombreCompleto(),
                request.getTelefono(),
                request.getEspecialidad()
            );
            VeterinarioResponse response = convertirAResponse(veterinario);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al actualizar el veterinario");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * UPDATE - Cambiar estado de administrador
     * PATCH /api/admin/veterinarios/{id}/admin
     */
    @PatchMapping("/{id}/admin")
    public ResponseEntity<?> cambiarEstadoAdmin(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> request) {
        try {
            Boolean esAdmin = request.get("esAdministrador");
            Veterinario veterinario = gestorService.cambiarEstadoAdministrador(id, esAdmin);
            VeterinarioResponse response = convertirAResponse(veterinario);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al cambiar el estado del administrador");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * DELETE - Eliminar veterinario
     * DELETE /api/admin/veterinarios/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarVeterinario(@PathVariable Long id) {
        try {
            gestorService.eliminarVeterinario(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Veterinario eliminado exitosamente");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al eliminar el veterinario");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * READ - Obtener resumen de todos los veterinarios
     * GET /api/admin/veterinarios/resumen
     */
    @GetMapping("/resumen/lista")
    public ResponseEntity<?> obtenerResumen() {
        try {
            List<Map<String, Object>> resumen = gestorService.obtenerResumenVeterinarios();
            return new ResponseEntity<>(resumen, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al obtener el resumen");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * READ - Obtener estadísticas de veterinarios
     * GET /api/admin/veterinarios/estadisticas
     */
    @GetMapping("/estadisticas/general")
    public ResponseEntity<?> obtenerEstadisticas() {
        try {
            Map<String, Object> estadisticas = gestorService.obtenerEstadisticasVeterinarios();
            return new ResponseEntity<>(estadisticas, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al obtener las estadísticas");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * READ - Obtener agenda completa de todos los veterinarios
     * GET /api/admin/veterinarios/agenda/completa
     */
    @GetMapping("/agenda/completa")
    public ResponseEntity<?> obtenerAgendaCompleta() {
        try {
            Map<String, Object> agenda = gestorService.obtenerAgendaCompleta();
            return new ResponseEntity<>(agenda, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error al obtener la agenda completa");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Obtiene la agenda (reservas) de un veterinario específico.
     * GET /api/admin/veterinarios/{id}/agenda
     */
    @GetMapping("/{id}/agenda")
    public ResponseEntity<?> obtenerAgendaVeterinario(@PathVariable Long id) {
        try {
            List<Reserva> agenda = gestorService.obtenerAgendaVeterinario(id);
            return ResponseEntity.ok(agenda);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    /**
     * Helper - Convertir Veterinario a VeterinarioResponse
     */
    private VeterinarioResponse convertirAResponse(Veterinario veterinario) {
        return new VeterinarioResponse(
            veterinario.getId(),
            veterinario.getNombreCompleto(),
            veterinario.getEmail(),
            veterinario.getMatricula(),
            veterinario.getEspecialidad()
        );
    }
}
