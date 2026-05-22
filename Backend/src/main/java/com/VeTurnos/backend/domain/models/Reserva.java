package com.VeTurnos.backend.domain.models;

import com.VeTurnos.backend.domain.enums.EstadoReserva;

public class Reserva {
    private Long id;
    private Long mascotaId;
    private Long clienteId;
    private HorarioTurno horario;
    private EstadoReserva estado; // Usamos un Enum

    //Getters, Setters y Constructores
}