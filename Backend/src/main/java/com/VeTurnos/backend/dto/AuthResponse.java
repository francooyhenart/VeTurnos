// AuthResponse.java
package com.veturnos.backend.dto;

public class AuthResponse {
    private Long id;
    private String nombreCompleto;
    private String email;
    private String rol;

    public AuthResponse(Long id, String nombreCompleto, String email, String rol) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.email = email;
        this.rol = rol;
    }

    // Getters
    public Long getId() { return id; }
    public String getNombreCompleto() { return nombreCompleto; }
    public String getEmail() { return email; }
    public String getRol() { return rol; }
}