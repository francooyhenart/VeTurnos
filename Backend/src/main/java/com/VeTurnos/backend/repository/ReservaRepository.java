package com.veturnos.backend.repository;

import com.veturnos.backend.dto.MetricaSedeDTO;
import com.veturnos.backend.dto.MetricaVeterinarioDTO;
import com.veturnos.backend.enums.EstadoReserva;
import com.veturnos.backend.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @Query("SELECT COUNT(r) > 0 FROM Reserva r LEFT JOIN r.veterinario v " +
            "WHERE r.estado <> :estado " +
            "AND r.fechaHora < :nuevoFin " +
            "AND r.fechaHora >= :nuevoInicio " +
            "AND (" +
            "     (:veterinarioId IS NULL) " +
            "     OR (v.id = :veterinarioId) " +
            "     OR (v.id IS NULL)" +
            ")")
    boolean existeSolapamiento(
            @Param("nuevoInicio") LocalDateTime nuevoInicio,
            @Param("nuevoFin") LocalDateTime nuevoFin,
            @Param("estado") EstadoReserva estado,
            @Param("veterinarioId") Long veterinarioId
    );

    @Query("SELECT r FROM Reserva r LEFT JOIN r.veterinario v LEFT JOIN v.sede s " +
            "WHERE r.fechaHora <= :fin " +
            "AND r.fechaHora >= :inicio " +
            "AND (:sedeId IS NULL OR s.id = :sedeId) " +
            "AND (" +
            "     (:veterinarioId IS NULL) " +
            "     OR (v.id = :veterinarioId) " +
            "     OR (v.id IS NULL) " +
            ")")
    List<Reserva> findReservasDelDia(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin,
            @Param("sedeId") Long sedeId,
            @Param("veterinarioId") Long veterinarioId
    );

    @Query("SELECT r FROM Reserva r LEFT JOIN r.veterinario v LEFT JOIN v.sede s " +
            "WHERE r.fechaHora <= :fin " +
            "AND r.fechaHora >= :inicio " +
            "AND r.fechaHora > :ahora " +
            "AND (:sedeId IS NULL OR s.id = :sedeId) " +
            "AND (" +
            "     (v.id = :veterinarioId) " +
            "     OR (v.id IS NULL) " +
            ")")
    List<Reserva> findDisponibilidad(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin,
            @Param("ahora") LocalDateTime ahora,
            @Param("sedeId") Long sedeId,
            @Param("veterinarioId") Long veterinarioId
    );

    List<Reserva> findByVeterinario(com.veturnos.backend.model.Veterinario veterinario);

    @Query("SELECT r FROM Reserva r WHERE r.veterinario.id = :veterinarioId ORDER BY r.fechaHora ASC")
    List<Reserva> findByVeterinarioId(@Param("veterinarioId") Long veterinarioId);

    List<Reserva> findByVeterinarioIdAndEstadoAndFechaHoraAfterOrderByFechaHoraAsc(Long veterinarioId, EstadoReserva estado, LocalDateTime ahora);
    List<Reserva> findByEstadoAndFechaHoraBefore(EstadoReserva estado, LocalDateTime ahora);

    @Query("SELECT COUNT(r) > 0 FROM Reserva r WHERE r.veterinario.sede.id = :sedeId")
    boolean existeReservaEnSede(@Param("sedeId") Long sedeId);

    List<Reserva> findByMascotaIdAndEstadoInOrderByFechaHoraAsc(Long mascotaId, List<EstadoReserva> estados);

    @Query("SELECT new com.veturnos.backend.dto.MetricaSedeDTO(s.nombre, COUNT(r)) FROM Reserva r JOIN r.veterinario v JOIN v.sede s WHERE r.estado IN :estados GROUP BY s.nombre ORDER BY COUNT(r) DESC")
    List<MetricaSedeDTO> contarTurnosPorSede(@Param("estados") List<EstadoReserva> estados);

    @Query("SELECT new com.veturnos.backend.dto.MetricaVeterinarioDTO(v.nombreCompleto, COUNT(r)) FROM Reserva r JOIN r.veterinario v WHERE r.estado IN :estados GROUP BY v.nombreCompleto ORDER BY COUNT(r) DESC")
    List<MetricaVeterinarioDTO> contarTurnosPorVeterinario(@Param("estados") List<EstadoReserva> estados);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.estado IN :estados")
    long contarTurnosTotal(@Param("estados") List<EstadoReserva> estados);
}