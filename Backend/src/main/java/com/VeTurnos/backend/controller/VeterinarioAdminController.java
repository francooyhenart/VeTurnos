// VeterinarioAdminController.java
package com.VeTurnos.backend.controller;

import com.VeTurnos.backend.dto.VeterinarioRequest;
import com.VeTurnos.backend.dto.VeterinarioResponse;
import com.VeTurnos.backend.service.VeterinarioAdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

// @RestController - DESACTIVADO: Usar GestorVeterinarioController en su lugar
@RequestMapping("/api/admin/veterinarios")
@Deprecated(since = "1.0", forRemoval = true)
public class VeterinarioAdminController {

    private final VeterinarioAdminService veterinarioAdminService;

    public VeterinarioAdminController(VeterinarioAdminService veterinarioAdminService) {
        this.veterinarioAdminService = veterinarioAdminService;
    }

    // CREATE
    @PostMapping
    public ResponseEntity<?> crearVeterinario(@Valid @RequestBody VeterinarioRequest request) {
        try {
            VeterinarioResponse response = veterinarioAdminService.crearVeterinario(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // READ - Obtener todos
    @GetMapping
    public ResponseEntity<List<VeterinarioResponse>> obtenerTodos() {
        List<VeterinarioResponse> veterinarios = veterinarioAdminService.obtenerTodos();
        return new ResponseEntity<>(veterinarios, HttpStatus.OK);
    }

    // READ - Obtener por ID
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            VeterinarioResponse response = veterinarioAdminService.obtenerPorId(id);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }
    }

    // UPDATE
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarVeterinario(
            @PathVariable Long id,
            @Valid @RequestBody VeterinarioRequest request) {
        try {
            VeterinarioResponse response = veterinarioAdminService.actualizarVeterinario(id, request);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        }
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarVeterinario(@PathVariable Long id) {
        try {
            veterinarioAdminService.eliminarVeterinario(id);
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Veterinario eliminado exitosamente");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
        }
    }

    // Consultar agenda de todos los veterinarios
    @GetMapping("/agenda/todas")
    public ResponseEntity<?> obtenerAgendaCompleta() {
        try {
            // Aquí irá la lógica para obtener agenda de todos
            // Por ahora es un placeholder
            Map<String, String> respuesta = new HashMap<>();
            respuesta.put("mensaje", "Endpoint para agenda de todos los veterinarios");
            return new ResponseEntity<>(respuesta, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}