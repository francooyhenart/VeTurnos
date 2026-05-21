package com.veturnos.backend.model;

import com.veturnos.backend.enums.Rol;
import jakarta.persistence.*;

@Entity
@Table(name = "veterinarios")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Veterinario extends Usuario {

    @Column(nullable = false)
    private String matricula;

    private String especialidad;

    @Column(nullable = false)
    private Boolean esAdministrador;

    public Veterinario() {
        super();
    }

    public Veterinario(String nombreCompleto, String dni, String telefono, String email, String password,
                       String matricula, String especialidad, Boolean esAdministrador) {
        super(nombreCompleto, dni, telefono, email, password, Rol.VETERINARIO);

        if (matricula == null || matricula.trim().isEmpty()) {
            throw new IllegalArgumentException("La matrícula profesional es obligatoria");
        }

        this.matricula = matricula;
        this.especialidad = especialidad;
        this.esAdministrador = esAdministrador != null ? esAdministrador : false;
    }

    // Getters y Setters
    public String getMatricula() { return matricula; }
    public String getEspecialidad() { return especialidad; }
    public Boolean getEsAdministrador() { return esAdministrador; }
}