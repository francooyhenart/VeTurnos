// AuthResponse.java
package com.VeTurnos.backend.dto;

public class AuthResponse {
    private Long id;
    private String nombreCompleto;
    private String email;
    private String rol;
    private String token;

    public AuthResponse(Long id, String nombreCompleto, String email, String rol, String token) {
        this.id = id;
        this.nombreCompleto = nombreCompleto;
        this.email = email;
        this.rol = rol;
        this.token = token;
    }

    // Getters
    public Long getId() { return id; }
    public String getNombreCompleto() { return nombreCompleto; }
    public String getEmail() { return email; }
    public String getRol() { return rol; }
    public String getToken() { return token; }
}