// MascotaResponse.java
package com.VeTurnos.backend.dto;

public class MascotaResponse {
    private Long id;
    private String nombre;
    private String especie;
    private String raza;
    private Integer edad;
    private Long clienteId;
    private String nombreDueño;
    private String dniDueño;

    public MascotaResponse(Long id, String nombre, String especie, String raza, Integer edad, Long clienteId,
                            String nombreDueño, String dniDueño) {
        this.id = id;
        this.nombre = nombre;
        this.especie = especie;
        this.raza = raza;
        this.edad = edad;
        this.clienteId = clienteId;
        this.nombreDueño = nombreDueño;
        this.dniDueño = dniDueño;
    }

    // Getters
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getEspecie() { return especie; }
    public String getRaza() { return raza; }
    public Integer getEdad() { return edad; }
    public Long getClienteId() { return clienteId; }
    public String getNombreDueño() { return nombreDueño; }
    public String getDniDueño() { return dniDueño; }
}