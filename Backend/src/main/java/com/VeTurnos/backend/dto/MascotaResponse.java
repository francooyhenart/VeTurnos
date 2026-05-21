// MascotaResponse.java
package com.veturnos.backend.dto;

public class MascotaResponse {
    private Long id;
    private String nombre;
    private String especie;
    private String raza;
    private Integer edad;
    private Long clienteId;

    public MascotaResponse(Long id, String nombre, String especie, String raza, Integer edad, Long clienteId) {
        this.id = id;
        this.nombre = nombre;
        this.especie = especie;
        this.raza = raza;
        this.edad = edad;
        this.clienteId = clienteId;
    }

    // Getters
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getEspecie() { return especie; }
    public String getRaza() { return raza; }
    public Integer getEdad() { return edad; }
    public Long getClienteId() { return clienteId; }
}