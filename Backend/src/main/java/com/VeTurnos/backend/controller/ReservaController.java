package com.VeTurnos.backend.controller;

import com.VeTurnos.backend.dto.ReservaRequest;
import com.VeTurnos.backend.dto.ReservaResponse;
import com.VeTurnos.backend.dto.ObservacionesClinicasRequest;
import com.VeTurnos.backend.dto.HistorialClinicoResponse;
import com.VeTurnos.backend.service.ReservaService;
import com.VeTurnos.backend.service.JwtTokenProvider;
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
    private final JwtTokenProvider jwtTokenProvider;

    public ReservaController(ReservaService reservaService, JwtTokenProvider jwtTokenProvider) {
        this.reservaService = reservaService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping
    public ResponseEntity<?> crearReserva(
            @Valid @RequestBody ReservaRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Punto 10: si quien crea el turno es un Veterinario, el vet asignado
            // SIEMPRE es el que está logueado (no se confía en lo que mande el
            // frontend) — se toma del JWT, ignorando cualquier veterinarioId recibido.
            String token = jwtTokenProvider.extractToken(authHeader);
            if (token != null && jwtTokenProvider.validateToken(token)
                    && "VETERINARIO".equals(jwtTokenProvider.getRolFromToken(token))) {
                request.setVeterinarioId(jwtTokenProvider.getUserIdFromToken(token));
            }

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
            // Cancelación tardía: Se procesó la baja pero avisa el recargo (US-04 AC 02)
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

    @GetMapping("/agenda")
    public ResponseEntity<?> obtenerAgenda(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long sedeId,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        try {
            // Punto 5: si quien consulta es un Veterinario, se fuerza el filtro a
            // sus propios turnos (+ los todavía sin asignar) a partir del JWT.
            // Nunca debe recibir turnos ya asignados a otro profesional. El gestor
            // sigue viendo todos los turnos de la sede, sin este filtro.
            Long veterinarioId = null;
            String token = jwtTokenProvider.extractToken(authHeader);
            if (token != null && jwtTokenProvider.validateToken(token)
                    && "VETERINARIO".equals(jwtTokenProvider.getRolFromToken(token))) {
                veterinarioId = jwtTokenProvider.getUserIdFromToken(token);
            }

            List<ReservaResponse> response = reservaService.obtenerAgendaDelDia(fecha, sedeId, veterinarioId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al consultar la agenda");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Disponibilidad de turnos para el cliente: solo horarios futuros, con
     * filtro opcional por sede. No confundir con /agenda (usada por vet/gestor,
     * que necesita ver también los turnos ya transcurridos del día).
     * GET /api/reservas/disponibilidad?fecha=YYYY-MM-DD&sedeId=1
     */
    @GetMapping("/disponibilidad")
    public ResponseEntity<?> obtenerDisponibilidad(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long sedeId) {
        try {
            List<ReservaResponse> response = reservaService.obtenerDisponibilidad(fecha, sedeId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al consultar la disponibilidad");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/{id}/asistencia")
    public ResponseEntity<?> cambiarAsistencia(
            @PathVariable Long id,
            @RequestParam String estado,
            @RequestParam(required = false) Long veterinarioId) {
        try {
            ReservaResponse response = reservaService.registrarAsistencia(id, estado, veterinarioId);
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

    /**
     * Carga/edita el diagnóstico del turno (ficha médica), desacoplado del
     * cambio de estado de asistencia: el vet puede cargarlo en cualquier momento.
     * PATCH /api/reservas/{id}/observaciones
     */
    @PatchMapping("/{id}/observaciones")
    public ResponseEntity<?> registrarObservaciones(
            @PathVariable Long id,
            @Valid @RequestBody ObservacionesClinicasRequest request) {
        try {
            ReservaResponse response = reservaService.registrarObservaciones(id, request.getObservacionesClinicas());
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException | IllegalStateException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al guardar las observaciones");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Búsqueda Global de Pacientes: historial clínico completo de una mascota
     * (turnos COMPLETADO), sin importar la sede o el veterinario que la atendió.
     * GET /api/reservas/historial/{mascotaId}
     */
    @GetMapping("/historial/{mascotaId}")
    public ResponseEntity<?> obtenerHistorialClinico(@PathVariable Long mascotaId) {
        try {
            List<HistorialClinicoResponse> response = reservaService.obtenerHistorialClinico(mascotaId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al consultar el historial clínico");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/veterinario/{veterinarioId}")
    public ResponseEntity<?> obtenerAgendaPorVeterinario(@PathVariable Long veterinarioId) {
        try {
            List<ReservaResponse> response = reservaService.obtenerAgendaPorVeterinario(veterinarioId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al consultar la agenda del veterinario");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Punto 6: próximos turnos pendientes de un veterinario, sin importar el día,
     * ordenados por fecha/hora. Para que el Manager tenga un panorama completo.
     * GET /api/reservas/veterinario/{veterinarioId}/proximos
     */
    @GetMapping("/veterinario/{veterinarioId}/proximos")
    public ResponseEntity<?> obtenerProximosTurnosPorVeterinario(@PathVariable Long veterinarioId) {
        try {
            List<ReservaResponse> response = reservaService.obtenerProximosTurnosVeterinario(veterinarioId);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Ocurrió un error inesperado al consultar los próximos turnos");
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}