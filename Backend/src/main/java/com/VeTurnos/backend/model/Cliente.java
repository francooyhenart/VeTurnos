// Cliente.java

package com.VeTurnos.backend.model;

import com.VeTurnos.backend.enums.Rol;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "clientes")
@PrimaryKeyJoinColumn(name = "usuario_id")
public class Cliente extends Usuario {

    @OneToMany(mappedBy = "dueño", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Mascota> mascotas = new ArrayList<>();

    public Cliente() {
        super();
    }

    public Cliente(String nombreCompleto, String dni, String telefono, String email, String password) {
        super(nombreCompleto, dni, telefono, email, password, Rol.CLIENTE);
    }

    public List<Mascota> getMascotas() {
        return mascotas;
    }

    public void agregarMascota(Mascota mascota) {
        this.mascotas.add(mascota);
        mascota.setDueño(this);
    }
} 