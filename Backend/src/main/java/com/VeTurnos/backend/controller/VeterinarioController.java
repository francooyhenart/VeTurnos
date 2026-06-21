// VeterinarioController.java (Nuevo para Entrega 2 - Controlador de Cartilla Médica)

package com.veturnos.backend.controller;

import com.veturnos.backend.service.VeterinarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/veterinarios")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class VeterinarioController {

    private final VeterinarioService veterinarioService;

    public VeterinarioController(VeterinarioService veterinarioService) {
        this.veterinarioService = veterinarioService;
    }

    /**
     * Endpoint REST que expone la lista de profesionales veterinarios
     * para el dropdown dinámico de reservas en la aplicación móvil.
     */
    @GetMapping
    public ResponseEntity<?> obtenerTodos() {
        try {
            List<Map<String, Object>> response = veterinarioService.listarCartillaMedica();
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al obtener la cartilla de profesionales");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}