package com.veturnos.backend.repository;

import com.veturnos.backend.enums.EstadoReserva;
import com.veturnos.backend.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    List<Reserva> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    boolean existsByFechaHoraAndEstadoNot(LocalDateTime fechaHora, EstadoReserva estado);
}