package com.veturnos.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import java.time.LocalTime;

// DTO específico para PUT: mapea correctamente todos los campos mutables, incluyendo la jornada laboral
public class VeterinarioUpdateRequest {

    private String nombreCompleto;
    private String telefono;
    private String especialidad;

    @Email(message = "El formato del email no es válido")
    private String email;

    private String matricula;

    private Long sedeId;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime horaInicio;

    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime horaFin;

    public String getNombreCompleto() { return nombreCompleto; }
    public String getTelefono() { return telefono; }
    public String getEspecialidad() { return especialidad; }
    public String getEmail() { return email; }
    public String getMatricula() { return matricula; }
    public Long getSedeId() { return sedeId; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }
    public LocalTime getHoraFin() { return horaFin; }
    public void setHoraFin(LocalTime horaFin) { this.horaFin = horaFin; }
}