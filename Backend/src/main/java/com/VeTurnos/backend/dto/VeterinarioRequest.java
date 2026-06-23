// VeterinarioRequest.java
package com.VeTurnos.backend.dto;

import jakarta.validation.constraints.*;

public class VeterinarioRequest {
    
    @NotBlank(message = "El nombre completo es obligatorio")
    private String nombreCompleto;

    @NotBlank(message = "El DNI es obligatorio")
    @Pattern(regexp = "\\d{7,8}", message = "El DNI debe tener 7 u 8 dígitos")
    private String dni;

    @NotBlank(message = "El teléfono es obligatorio")
    private String telefono;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;

    @NotBlank(message = "La matrícula es obligatoria")
    private String matricula;

    private String especialidad;

    // Getters
    public String getNombreCompleto() { return nombreCompleto; }
    public String getDni() { return dni; }
    public String getTelefono() { return telefono; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getMatricula() { return matricula; }
    public String getEspecialidad() { return especialidad; }
}