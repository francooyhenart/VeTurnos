// Mascota.java

package com.VeTurnos.backend.model;

import com.VeTurnos.backend.enums.Especie;
import jakarta.persistence.*;

@Entity
@Table(name = "mascotas")
public class Mascota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Especie especie;

    @Column(nullable = false)
    private String raza;

    @Column(nullable = false)
    private Integer edad;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente dueño;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String foto;

    public Mascota() {}

    public Mascota(String nombre, Especie especie, String raza, Integer edad, Cliente dueño) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la mascota no puede estar vacío");
        }
        if (especie == null) {
            throw new IllegalArgumentException("La especie es obligatoria");
        }
        if (edad != null && edad < 0) {
            throw new IllegalArgumentException("La edad no puede ser negativa");
        }
        if (dueño == null) {
            throw new IllegalArgumentException("La mascota debe estar asociada a un dueño (cliente)");
        }
        this.nombre = nombre;
        this.especie = especie;
        this.raza = raza == null ? "" : raza.trim();
        this.edad = edad;
        this.dueño = dueño;
    }

// Getters y Setters
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public Especie getEspecie() { return especie; }
    public String getRaza() { return raza; }
    public Integer getEdad() { return edad; }
    public Cliente getDueño() { return dueño; }
    public String getFoto() { return foto; }

    public void setDueño(Cliente dueño) {
        this.dueño = dueño;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }
} 