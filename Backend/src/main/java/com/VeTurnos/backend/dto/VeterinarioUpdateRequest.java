// VeterinarioUpdateRequest.java
package com.VeTurnos.backend.dto;

import jakarta.validation.constraints.Email;

// DTO específico para PUT: a diferencia de VeterinarioRequest (creación),
// los campos son opcionales para permitir actualizaciones parciales.
public class VeterinarioUpdateRequest {

    private String nombreCompleto;
    private String telefono;
    private String especialidad;

    @Email(message = "El formato del email no es válido")
    private String email;

    private String matricula;

    // Opcional: el Manager puede reasignar la sede del veterinario
    private Long sedeId;

    public String getNombreCompleto() { return nombreCompleto; }
    public String getTelefono() { return telefono; }
    public String getEspecialidad() { return especialidad; }
    public String getEmail() { return email; }
    public String getMatricula() { return matricula; }
    public Long getSedeId() { return sedeId; }
}
