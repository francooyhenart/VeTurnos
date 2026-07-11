package com.veturnos.backend.model;

import com.veturnos.backend.enums.Rol;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gestores_veterinarios")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class GestorVeterinarios extends com.veturnos.backend.model.Usuario {

    @Column(nullable = false)
    private String numeroEmpleado;

    @Column(nullable = true)
    private LocalDateTime fechaAsignacion;

    // Auditoría
    @Column
    private LocalDateTime ultimaModificacion;

    @Column
    private String modificadoPor;

    public GestorVeterinarios() {
        super();
    }

    public GestorVeterinarios(String nombreCompleto, String dni, String telefono, 
                              String email, String password, String numeroEmpleado) {
        super(nombreCompleto, dni, telefono, email, password, Rol.GESTOR_VETERINARIOS);

        if (numeroEmpleado == null || numeroEmpleado.trim().isEmpty()) {
            throw new IllegalArgumentException("El número de empleado es obligatorio");
        }

        this.numeroEmpleado = numeroEmpleado;
        this.fechaAsignacion = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.fechaAsignacion == null) {
            this.fechaAsignacion = LocalDateTime.now();
        }
    }

    // Getters y Setters
    public String getNumeroEmpleado() { return numeroEmpleado; }
    public LocalDateTime getFechaAsignacion() { return fechaAsignacion; }
    public LocalDateTime getUltimaModificacion() { return ultimaModificacion; }
    public String getModificadoPor() { return modificadoPor; }

    public void setUltimaModificacion(LocalDateTime ultimaModificacion) { 
        this.ultimaModificacion = ultimaModificacion; 
    }
    public void setModificadoPor(String modificadoPor) { 
        this.modificadoPor = modificadoPor; 
    }
}
