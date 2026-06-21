package com.veturnos.backend.repository;

import com.veturnos.backend.enums.EstadoReserva;
import com.veturnos.backend.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    // 🚀 E2: Modificado para validar el solapamiento únicamente en la agenda del veterinario especificado
    @Query("SELECT COUNT(r) > 0 FROM Reserva r WHERE r.veterinario.id = :veterinarioId AND r.estado <> :estado " +
            "AND :nuevoInicio < r.fechaHora + (r.duracionMinutos * 1 minute) " +
            "AND :nuevoFin > r.fechaHora")
    boolean existeSolapamientoPorVeterinario(
            @Param("nuevoInicio") LocalDateTime nuevoInicio,
            @Param("nuevoFin") LocalDateTime nuevoFin,
            @Param("veterinarioId") Long registrarVeterinarioId,
            @Param("estado") EstadoReserva estado
    );

    // Mantenemos soporte por si se requiere validar de forma global o flujos heredados
    @Query("SELECT COUNT(r) > 0 FROM Reserva r WHERE r.estado <> :estado " +
            "AND :nuevoInicio < r.fechaHora + (r.duracionMinutos * 1 minute) " +
            "AND :nuevoFin > r.fechaHora")
    boolean existeSolapamiento(
            @Param("nuevoInicio") LocalDateTime nuevoInicio,
            @Param("nuevoFin") LocalDateTime nuevoFin,
            @Param("estado") EstadoReserva estado
    );

    // Trae todos los turnos del día de forma global
    @Query("SELECT r FROM Reserva r WHERE r.fechaHora < :fin " +
            "AND r.fechaHora + (r.duracionMinutos * 1 minute) > :inicio")
    List<Reserva> findReservasDelDia(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );

    // 🚀 E2: Nuevo query relacional para filtrar la agenda por fecha y profesional asignado (US-03 / US-06)
    @Query("SELECT r FROM Reserva r WHERE r.veterinario.id = :veterinarioId AND r.fechaHora < :fin " +
            "AND r.fechaHora + (r.duracionMinutos * 1 minute) > :inicio")
    List<Reserva> findReservasDelDiaPorVeterinario(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin,
            @Param("veterinarioId") Long veterinarioId
    );
}