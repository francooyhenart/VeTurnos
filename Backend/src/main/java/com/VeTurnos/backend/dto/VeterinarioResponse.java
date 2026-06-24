// VeterinarioResponse.java
package com.VeTurnos.backend.dto;

public class VeterinarioResponse {

    private Long id;
    private String nombreCompleto;
    private String email;
    private String matricula;
    private String especialidad;
    private String telefono;

    public VeterinarioResponse(Long id, String nombreCompleto, String email,
                               String matricula, String especialidad, String telefono) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.email = email;
        this.matricula = matricula;
        this.especialidad = especialidad;
        this.telefono = telefono;
    }

    // Getters
    public Long getId() { return id; }
    public String getNombreCompleto() { return nombreCompleto; }
    public String getEmail() { return email; }
    public String getMatricula() { return matricula; }
    public String getEspecialidad() { return especialidad; }
    public String getTelefono() { return telefono; }
} 