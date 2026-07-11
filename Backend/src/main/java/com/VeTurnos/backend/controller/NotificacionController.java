package com.veturnos.backend.controller;

import com.veturnos.backend.dto.NotificacionResponse;
import com.veturnos.backend.service.NotificacionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(originPatterns = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    /**
     * Trae todas las notificaciones de un usuario (para la campanita)
     * GET /api/notificaciones/usuario/1
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> obtenerNotificaciones(@PathVariable Long usuarioId) {
        try {
            List<NotificacionResponse> response = notificacionService.obtenerPorUsuario(usuarioId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al recuperar las notificaciones");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Devuelve la cantidad de notificaciones sin leer (para el globito indicador)
     * GET /api/notificaciones/usuario/1/sin-leer
     */
    @GetMapping("/usuario/{usuarioId}/sin-leer")
    public ResponseEntity<?> obtenerCantidadSinLeer(@PathVariable Long usuarioId) {
        try {
            long cantidad = notificacionService.obtenerCantidadSinLeer(usuarioId);
            Map<String, Object> response = new HashMap<>();
            response.put("usuarioId", usuarioId);
            response.put("cantidadSinLeer", cantidad);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener el contador de alertas");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Marca una notificación específica como leída cuando el usuario interactúa
     * PATCH /api/notificaciones/{id}/leido
     */
    @PatchMapping("/{id}/leido")
    public ResponseEntity<?> marcarComoLeida(@PathVariable Long id) {
        try {
            NotificacionResponse response = notificacionService.marcarComoLeida(id);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar el estado de la notificación");
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}