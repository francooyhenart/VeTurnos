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

    List<Reserva> findByVeterinario(com.VeTurnos.backend.model.Veterinario veterinario);

    @Query("SELECT r FROM Reserva r WHERE r.veterinario.id = :veterinarioId ORDER BY r.fechaHora ASC")
    List<Reserva> findByVeterinarioId(@Param("veterinarioId") Long veterinarioId);

    List<Reserva> findByVeterinarioIdAndEstadoAndFechaHoraAfterOrderByFechaHoraAsc(Long veterinarioId, EstadoReserva estado, LocalDateTime ahora);
    @Query("SELECT r FROM Reserva r " +
            "WHERE r.estado = :estado " +
            "AND r.fechaHora + (r.duracionMinutos * 1 minute) < :ahora")
   List<Reserva> findVencidosPorEstado(
           @Param("estado") EstadoReserva estado,
           @Param("ahora") LocalDateTime ahora
    );

    @Query("SELECT COUNT(r) > 0 FROM Reserva r WHERE r.veterinario.sede.id = :sedeId")
    boolean existeReservaEnSede(@Param("sedeId") Long sedeId);

    List<Reserva> findByMascotaIdAndEstadoInOrderByFechaHoraAsc(Long mascotaId, List<EstadoReserva> estados);

    @Query("SELECT new com.VeTurnos.backend.dto.MetricaSedeDTO(s.nombre, COUNT(r)) FROM Reserva r JOIN r.veterinario v JOIN v.sede s WHERE r.estado IN :estados GROUP BY s.nombre ORDER BY COUNT(r) DESC")
    List<MetricaSedeDTO> contarTurnosPorSede(@Param("estados") List<EstadoReserva> estados);

    @Query("SELECT new com.VeTurnos.backend.dto.MetricaVeterinarioDTO(v.nombreCompleto, COUNT(r)) FROM Reserva r JOIN r.veterinario v WHERE r.estado IN :estados GROUP BY v.nombreCompleto ORDER BY COUNT(r) DESC")
    List<MetricaVeterinarioDTO> contarTurnosPorVeterinario(@Param("estados") List<EstadoReserva> estados);

    @Query("SELECT COUNT(r) FROM Reserva r WHERE r.estado IN :estados")
    long contarTurnosTotal(@Param("estados") List<EstadoReserva> estados);

    //Busca turnos PENDIENTES que arranquen en un rango de tiempo específico (sirve para enganchar la ventana de 24hs y 3hs)
    List<Reserva> findByEstadoAndFechaHoraBetween(EstadoReserva estado, LocalDateTime inicio, LocalDateTime fin);

    //Verifica si ya le creamos una notificación de ese estilo al cliente para evitar duplicados
    @Query("SELECT COUNT(n) > 0 FROM Notificacion n WHERE n.usuario.id = :usuarioId AND n.titulo = :titulo AND n.mensaje LIKE %:mascotaNome%")
    boolean existeNotificacionDuplicada(@Param("usuarioId") Long usuarioId, @Param("titulo") String titulo, @Param("mascotaNome") String mascotaNome);
}