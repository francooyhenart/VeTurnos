package com.veturnos.backend.dto;

import java.time.LocalTime;

public class VeterinarioResponse {

    private Long id;
    private String nombreCompleto;
    private String email;
    private String matricula;
    private String especialidad;
    private String telefono;
    private SedeResponse sede;
    private LocalTime horaInicio;
    private LocalTime horaFin;

    // Constructor Principal (El nuevo de 9 parámetros)
    public VeterinarioResponse(Long id, String nombreCompleto, String email,
                               String matricula, String especialidad, String telefono,
                               SedeResponse sede, LocalTime horaInicio, LocalTime horaFin) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.email = email;
        this.matricula = matricula;
        this.especialidad = especialidad;
        this.telefono = telefono;
        this.sede = sede;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
    }

    // 🟢 CONSTRUCTOR SOBRECARGADO (El viejo de 7 parámetros)
    // Esto salva las llamadas viejas asignando la jornada estándar por defecto
    public VeterinarioResponse(Long id, String nombreCompleto, String email,
                               String matricula, String especialidad, String telefono,
                               SedeResponse sede) {
        this(id, nombreCompleto, email, matricula, especialidad, telefono, sede,
                LocalTime.of(9, 0), LocalTime.of(18, 0));
    }

    // Getters
    public Long getId() { return id; }
    public String getNombreCompleto() { return nombreCompleto; }
    public String getEmail() { return email; }
    public String getMatricula() { return matricula; }
    public String getEspecialidad() { return especialidad; }
    public String getTelefono() { return telefono; }
    public SedeResponse getSede() { return sede; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public LocalTime getHoraFin() { return horaFin; }
}