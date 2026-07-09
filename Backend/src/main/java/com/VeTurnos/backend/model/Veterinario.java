package com.VeTurnos.backend.model;

import com.VeTurnos.backend.enums.Rol;
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

    // columnDefinition con DEFAULT para que Hibernate pueda hacer el ALTER TABLE
    // sobre la tabla ya poblada sin violar el NOT NULL en las filas existentes
    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean activo;

    // Nullable: los veterinarios existentes no tienen sede asignada hasta que el
    // Manager se la asigne; así el ALTER TABLE no rompe filas ya pobladas.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sede_id", nullable = true)
    private Sede sede;

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
        this.activo = true;
    }

    public String getMatricula() { return matricula; }
    public String getEspecialidad() { return especialidad; }
    public Boolean getEsAdministrador() { return esAdministrador; }
    public Boolean getActivo() { return activo; }
    public Sede getSede() { return sede; }

    public void setEspecialidad(String especialidad) {
        this.especialidad = especialidad;
    }

    public void setMatricula(String matricula) {
        if (matricula == null || matricula.trim().isEmpty()) {
            throw new IllegalArgumentException("La matrícula profesional es obligatoria");
        }
        this.matricula = matricula;
    }

    public void setEsAdministrador(Boolean esAdministrador) {
        this.esAdministrador = esAdministrador != null ? esAdministrador : false;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo != null ? activo : false;
    }

    public void setSede(Sede sede) {
        this.sede = sede;
    }
}