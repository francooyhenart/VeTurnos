// Sede.java

package com.veturnos.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sedes")
public class Sede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    // Nullable a nivel de columna a propósito: la tabla "sedes" ya puede tener
    // filas de la versión anterior (con solo "nombre"/"direccion"), y un ALTER
    // TABLE agregando una columna NOT NULL sin default rompe contra filas
    // existentes (mismo problema que tuvimos con Veterinario.activo). La
    // obligatoriedad real se valida en el constructor/setters de Java.
    private String calle;

    private String numero;

    // Opcional: referencia entre qué calles está (ej. "San Martín y Belgrano")
    private String entreCalles;

    public Sede() {}

    public Sede(String nombre, String calle, String numero, String entreCalles) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la sede es obligatorio");
        }
        if (calle == null || calle.trim().isEmpty()) {
            throw new IllegalArgumentException("La calle es obligatoria");
        }
        if (numero == null || numero.trim().isEmpty()) {
            throw new IllegalArgumentException("El número es obligatorio");
        }
        this.nombre = nombre;
        this.calle = calle;
        this.numero = numero;
        this.entreCalles = entreCalles;
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getCalle() { return calle; }
    public String getNumero() { return numero; }
    public String getEntreCalles() { return entreCalles; }

    // Dirección armada para mostrar en listados, ej: "San Martín 123 (entre Belgrano y Sarmiento)"
    public String getDireccionCompleta() {
        String base = calle + " " + numero;
        if (entreCalles != null && !entreCalles.trim().isEmpty()) {
            base += " (entre " + entreCalles + ")";
        }
        return base;
    }

    public void setNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre de la sede es obligatorio");
        }
        this.nombre = nombre;
    }

    public void setCalle(String calle) {
        if (calle == null || calle.trim().isEmpty()) {
            throw new IllegalArgumentException("La calle es obligatoria");
        }
        this.calle = calle;
    }

    public void setNumero(String numero) {
        if (numero == null || numero.trim().isEmpty()) {
            throw new IllegalArgumentException("El número es obligatorio");
        }
        this.numero = numero;
    }

    public void setEntreCalles(String entreCalles) {
        this.entreCalles = entreCalles;
    }
}
