// SedeRequest.java
package com.veturnos.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class SedeRequest {

    @NotBlank(message = "El nombre de la sede es obligatorio")
    private String nombre;

    @NotBlank(message = "La calle es obligatoria")
    private String calle;

    @NotBlank(message = "El número es obligatorio")
    private String numero;

    // Opcional
    private String entreCalles;

    public String getNombre() { return nombre; }
    public String getCalle() { return calle; }
    public String getNumero() { return numero; }
    public String getEntreCalles() { return entreCalles; }
}
