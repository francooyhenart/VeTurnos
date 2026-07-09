// VeterinarioResponse.java
package com.VeTurnos.backend.dto;

public class VeterinarioResponse {

    private Long id;
    private String nombreCompleto;
    private String email;
    private String matricula;
    private String especialidad;
    private String telefono;
    private SedeResponse sede;

    public VeterinarioResponse(Long id, String nombreCompleto, String email,
                               String matricula, String especialidad, String telefono,
                               SedeResponse sede) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.email = email;
        this.matricula = matricula;
        this.especialidad = especialidad;
        this.telefono = telefono;
        this.sede = sede;
    }

    // Getters
    public Long getId() { return id; }
    public String getNombreCompleto() { return nombreCompleto; }
    public String getEmail() { return email; }
    public String getMatricula() { return matricula; }
    public String getEspecialidad() { return especialidad; }
    public String getTelefono() { return telefono; }
    public SedeResponse getSede() { return sede; }
} 