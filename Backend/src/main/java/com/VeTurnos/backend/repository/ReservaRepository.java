package com.veturnos.backend.repository;

import com.veturnos.backend.enums.EstadoReserva;
import com.veturnos.backend.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @Query("SELECT COUNT(r) > 0 FROM Reserva r WHERE r.estado <> :estado " +
            "AND :nuevoInicio < r.fechaHora + (r.duracionMinutos * 1 minute) " +
            "AND :nuevoFin > r.fechaHora")
    boolean existeSolapamiento(
            @Param("nuevoInicio") LocalDateTime nuevoInicio,
            @Param("nuevoFin") LocalDateTime nuevoFin,
            @Param("estado") EstadoReserva estado
    );

    // Trae los turnos que se superpongan de cualquier manera con el día consultado
    @Query("SELECT r FROM Reserva r WHERE r.fechaHora < :fin " +
            "AND r.fechaHora + (r.duracionMinutos * 1 minute) > :inicio")
    List<Reserva> findReservasDelDia(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );
}