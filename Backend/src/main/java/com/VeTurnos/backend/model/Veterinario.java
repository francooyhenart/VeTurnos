package com.veturnos.backend.model;

import com.veturnos.backend.enums.Rol;
import jakarta.persistence.*;
import java.time.LocalTime;

@Entity
@Table(name = "veterinarios")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Veterinario extends Usuario {

    @Column(nullable = false)
    private String matricula;

    private String especialidad;

    @Column(nullable = false)
    private Boolean esAdministrador;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean activo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sede_id", nullable = true)
    private Sede sede;

    @Column(nullable = false, columnDefinition = "TIME DEFAULT '09:00:00'")
    private LocalTime horaInicio;

    @Column(nullable = false, columnDefinition = "TIME DEFAULT '18:00:00'")
    private LocalTime horaFin;

    public Veterinario() {
        super();
    }

    public Veterinario(String nombreCompleto, String dni, String telefono, String email, String password,
                       String matricula, String especialidad, Boolean esAdministrador,
                       LocalTime horaInicio, LocalTime horaFin) {
        super(nombreCompleto, dni, telefono, email, password, Rol.VETERINARIO);

        if (matricula == null || matricula.trim().isEmpty()) {
            throw new IllegalArgumentException("La matrícula profesional es obligatoria");
        }
        if (horaInicio == null || horaFin == null) {
            throw new IllegalArgumentException("La franja horaria (inicio y fin) es obligatoria");
        }
        if (!horaInicio.isBefore(horaFin)) {
            throw new IllegalArgumentException("La hora de inicio debe ser anterior a la hora de fin");
        }

        this.matricula = matricula;
        this.especialidad = especialidad;
        this.esAdministrador = esAdministrador != null ? esAdministrador : false;
        this.activo = true;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
    }

    public String getMatricula() { return matricula; }
    public String getEspecialidad() { return especialidad; }
    public Boolean getEsAdministrador() { return esAdministrador; }
    public Boolean getActivo() { return activo; }
    public Sede getSede() { return sede; }
    public LocalTime getHoraInicio() { return horaInicio; }
    public LocalTime getHoraFin() { return horaFin; }

    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }
    public void setEsAdministrador(Boolean esAdministrador) { this.esAdministrador = esAdministrador != null ? esAdministrador : false; }
    public void setActivo(Boolean activo) { this.activo = activo != null ? activo : false; }
    public void setSede(Sede sede) { this.sede = sede; }

    public void setMatricula(String matricula) {
        if (matricula == null || matricula.trim().isEmpty()) {
            throw new IllegalArgumentException("La matrícula profesional es obligatoria");
        }
        this.matricula = matricula;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        if (horaInicio == null) throw new IllegalArgumentException("La hora de inicio es obligatoria");
        this.horaInicio = horaInicio;
    }

    public void setHoraFin(LocalTime horaFin) {
        if (horaFin == null) throw new IllegalArgumentException("La hora de fin es obligatoria");
        this.horaFin = horaFin;
    }
}