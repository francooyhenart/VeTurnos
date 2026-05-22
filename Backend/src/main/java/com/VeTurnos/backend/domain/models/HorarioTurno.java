package com.VeTurnos.backend.domain.models;

import java.time.LocalDateTime;

public class HorarioTurno {
    private LocalDateTime fechaHora;

    public HorarioTurno(LocalDateTime fechaHora) {
        if (fechaHora.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("No se pueden programar turnos en el pasado");
        }
        this.fechaHora = fechaHora;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }
}