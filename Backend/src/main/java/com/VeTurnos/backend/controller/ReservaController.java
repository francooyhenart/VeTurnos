package com.veturnos.backend.controller;

import com.veturnos.backend.dto.ReservaRequest;
import com.veturnos.backend.dto.ReservaResponse;
import com.veturnos.backend.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
@CrossOrigin(origins = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS})
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @PostMapping
    public ResponseEntity<?> crearReserva(@Valid @RequestBody ReservaRequest request) {
        try {
            ReservaResponse response = reservaService.reservarTurno(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al procesar la reserva");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelar(@PathVariable Long id) {
        try {
            reservaService.cancelarReserva(id);
            Map<String, String> okResponse = new HashMap<>();
            okResponse.put("mensaje", "La reserva fue cancelada con éxito y el horario quedó liberado");
            return new ResponseEntity<>(okResponse, HttpStatus.OK);
        } catch (IllegalStateException e) {
            Map<String, String> warningResponse = new HashMap<>();
            warningResponse.put("advertencia", e.getMessage());
            return new ResponseEntity<>(warningResponse, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al cancelar la reserva");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 🚀 E2: Modificado para admitir filtrado horizontal por Veterinario ID (US-03 / US-06)
    @GetMapping("/agenda")
    public ResponseEntity<?> obtenerAgenda(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long veterinarioId) {
        try {
            List<ReservaResponse> response = reservaService.obtenerAgendaDelDia(fecha, veterinarioId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al consultar la agenda");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/{id}/asistencia")
    public ResponseEntity<?> cambiarAsistencia(
            @PathVariable Long id,
            @RequestParam String estado) {
        try {
            ReservaResponse response = reservaService.registrarAsistencia(id, estado);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException | IllegalStateException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al actualizar el estado de asistencia");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // 🚀 E2: Nuevo Endpoint para persistir la Ficha Médica / Observaciones Clínicas (RF-12 / US-09)
    @PostMapping("/{id}/ficha-medica")
    public ResponseEntity<?> guardarFichaMedica(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String observaciones = body.get("observaciones");
            if (observaciones == null || observaciones.trim().isEmpty()) {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("error", "Las observaciones clínicas no pueden estar vacías");
                return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            }
            ReservaResponse response = reservaService.guardarFichaClinica(id, observaciones);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al guardar la ficha médica");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}