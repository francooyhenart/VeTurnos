package com.VeTurnos.backend.repository;

import com.VeTurnos.backend.dto.MetricaSedeDTO;
import com.VeTurnos.backend.dto.MetricaVeterinarioDTO;
import com.VeTurnos.backend.enums.EstadoReserva;
import com.VeTurnos.backend.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // Bug de aislamiento corregido: antes esta query comparaba contra TODA la
    // tabla, así que una cirugía de 2hs del veterinario A bloqueaba también
    // la agenda del veterinario B a esa misma hora. Ahora, si se recibe un
    // veterinarioId, el solapamiento se valida ÚNICAMENTE contra los turnos
    // de ese profesional (LEFT JOIN para no descartar turnos sin vet
    // asignado de la comparación). Si veterinarioId es null (turno sin
    // asignar), se mantiene la validación global, como pedía el requerimiento.
    @Query("SELECT COUNT(r) > 0 FROM Reserva r LEFT JOIN r.veterinario v " +
            "WHERE r.estado <> :estado " +
            "AND :nuevoInicio < r.fechaHora + (r.duracionMinutos * 1 minute) " +
            "AND :nuevoFin > r.fechaHora " +
            "AND (:veterinarioId IS NULL OR v.id = :veterinarioId)")
    boolean existeSolapamiento(
            @Param("nuevoInicio") LocalDateTime nuevoInicio,
            @Param("nuevoFin") LocalDateTime nuevoFin,
            @Param("estado") EstadoReserva estado,
            @Param("veterinarioId") Long veterinarioId
    );

    // Trae los turnos que se superpongan de cualquier manera con el día consultado.
    // Filtro opcional por sede (vía Veterinario -> Sede): con LEFT JOIN para no
    // excluir turnos sin veterinario/sede asignado cuando sedeId es null.
    // Punto 5: filtro opcional por veterinarioId — cuando lo llama un VETERINARIO
    // (forzado desde el controller a partir del JWT, nunca por lo que mande el
    // frontend), solo debe ver SUS turnos + los que todavía no tienen vet
    // asignado (para poder tomarlos); nunca los ya asignados a otro profesional.
    @Query("SELECT r FROM Reserva r LEFT JOIN r.veterinario v LEFT JOIN v.sede s " +
            "WHERE r.fechaHora < :fin " +
            "AND r.fechaHora + (r.duracionMinutos * 1 minute) > :inicio " +
            "AND (:sedeId IS NULL OR s.id = :sedeId) " +
            "AND (:veterinarioId IS NULL OR v.id IS NULL OR v.id = :veterinarioId)")
    List<Reserva> findReservasDelDia(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin,
            @Param("sedeId") Long sedeId,
            @Param("veterinarioId") Long veterinarioId
    );

    // Disponibilidad para el cliente: solo turnos futuros (fechaHora > ahora) y
    // filtrados por sede. Es una consulta DISTINTA de findReservasDelDia porque
    // esa la usa la agenda del vet/gestor y ahí SÍ deben verse los turnos ya
    // transcurridos del día (para poder marcarlos como asistidos, etc).
    @Query("SELECT r FROM Reserva r LEFT JOIN r.veterinario v LEFT JOIN v.sede s " +
            "WHERE r.fechaHora < :fin " +
            "AND r.fechaHora + (r.duracionMinutos * 1 minute) > :inicio " +
            "AND r.fechaHora > :ahora " +
            "AND (:sedeId IS NULL OR s.id = :sedeId)")
    List<Reserva> findDisponibilidad(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin,
            @Param("ahora") LocalDateTime ahora,
            @Param("sedeId") Long sedeId
    );

    // Obtener todas las reservas de un veterinario
    List<Reserva> findByVeterinario(com.VeTurnos.backend.model.Veterinario veterinario);

    // Obtener todas las reservas de un veterinario por su ID
    @Query("SELECT r FROM Reserva r WHERE r.veterinario.id = :veterinarioId ORDER BY r.fechaHora ASC")
    List<Reserva> findByVeterinarioId(@Param("veterinarioId") Long veterinarioId);

    // Punto 6: próximos turnos pendientes de un veterinario, sin importar el día, ordenados por fecha/hora
    List<Reserva> findByVeterinarioIdAndEstadoAndFechaHoraAfterOrderByFechaHoraAsc(
            Long veterinarioId, EstadoReserva estado, LocalDateTime ahora
    );

    List<Reserva> findByEstadoAndFechaHoraBefore(EstadoReserva estado, LocalDateTime ahora);

    // Punto 4: usado por SedeService para no permitir borrar una sede con turnos asignados
    // (vía Veterinario -> Sede; el path navega con inner join implícito, que es lo correcto acá)
    @Query("SELECT COUNT(r) > 0 FROM Reserva r WHERE r.veterinario.sede.id = :sedeId")
    boolean existeReservaEnSede(@Param("sedeId") Long sedeId);

    // Historial Clínico Global: todos los turnos que efectivamente ocurrieron
    // (ASISTIDO o COMPLETADO) de una mascota, sin importar la sede o el
    // veterinario que la atendió, orden cronológico. No se restringe solo a
    // COMPLETADO porque hoy no hay ningún flujo en la app que lleve un turno
    // a ese estado; el vet solo marca ASISTIDO.
    List<Reserva> findByMascotaIdAndEstadoInOrderByFechaHoraAsc(Long mascotaId, List<EstadoReserva> estados);

    // RF-18: Cantidad de turnos agrupados por sede (vía Reserva -> Veterinario -> Sede).
    // Punto 6: usa IN (no "=") porque en la app el estado real de un turno ya
    // atendido es ASISTIDO — no hay ningún flujo que lleve a COMPLETADO, así que
    // filtrar solo por ese estado dejaba las estadísticas siempre en cero.
    @Query("SELECT new com.VeTurnos.backend.dto.MetricaSedeDTO(s.nombre, COUNT(r)) " +
            "FROM Reserva r JOIN r.veterinario v JOIN v.sede s " +
            "WHERE r.estado IN :estados " +
            "GROUP BY s.nombre " +
            "ORDER BY COUNT(r) DESC")
    List<MetricaSedeDTO> contarTurnosPorSede(@Param("estados") List<EstadoReserva> estados);

    // RF-11: Cantidad de turnos agrupados por veterinario (nombre y apellido)
    @Query("SELECT new com.VeTurnos.backend.dto.MetricaVeterinarioDTO(v.nombreCompleto, COUNT(r)) " +
            "FROM Reserva r JOIN r.veterinario v " +
            "WHERE r.estado IN :estados " +
            "GROUP BY v.nombreCompleto " +
            "ORDER BY COUNT(r) DESC")
    List<MetricaVeterinarioDTO> contarTurnosPorVeterinario(@Param("estados") List<EstadoReserva> estados);

    // Total general de turnos atendidos, para la sección "Total General" del dashboard
    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.estado IN :estados")
    long contarTurnosTotal(@Param("estados") List<EstadoReserva> estados);
}