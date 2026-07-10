// MascotaRequest.java
package com.VeTurnos.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class MascotaRequest {

    @NotBlank(message = "El nombre de la mascota es obligatorio")
    private String nombre;

    @NotBlank(message = "La especie es obligatoria")
    private String especie; // Se validará contra el Enum en el Service

    private String raza;

    @Min(value = 0, message = "La edad no puede ser negativa")
    private Integer edad; // Nullable por si no se envía desde Android

    private Long clienteId; // ID del dueño para armar la relación

    private String foto;

    // Getters y Setters
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getEspecie() { return especie; }
    public void setEspecie(String especie) { this.especie = especie; }

    public String getRaza() { return raza; }
    public void setRaza(String raza) { this.raza = raza; }

    public Integer getEdad() { return edad; }
    public void setEdad(Integer edad) { this.edad = edad; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }
}