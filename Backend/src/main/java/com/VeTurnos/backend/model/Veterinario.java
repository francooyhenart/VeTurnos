// Veterinario.java (Cumple rol de Admin y Profesional único para la Entrega 1)

package com.veturnos.backend.model;

import com.veturnos.backend.enums.Rol;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "veterinarios")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Veterinario extends Usuario {

    @Column(nullable = false)
    private String matricula;

    private String especialidad;

    @Column(nullable = false)
    private Boolean esAdministrador;

    @OneToMany(mappedBy = "veterinario", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reserva> reservas = new ArrayList<>();

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
    public void setMatricula(String matricula) { this.matricula = matricula; }

    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }

    public Boolean getEsAdministrador() { return esAdministrador; }
    public void setEsAdministrador(Boolean esAdministrador) { this.esAdministrador = esAdministrador; }

    public List<Reserva> getReservas() { return reservas; }
    public void setReservas(List<Reserva> reservas) { this.reservas = reservas; }

    // Métodos helpers para mantener la consistencia de la relación bidireccional
    public void agregarReserva(Reserva reserva) {
        this.reservas.add(reserva);
        reserva.setVeterinario(this);
    }

    public void removerReserva(Reserva reserva) {
        this.reservas.remove(reserva);
        reserva.setVeterinario(null);
    }




} 