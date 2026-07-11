// SedeResponse.java
package com.veturnos.backend.dto;

public class SedeResponse {

    private Long id;
    private String nombre;
    private String calle;
    private String numero;
    private String entreCalles;
    private String direccionCompleta;

    public SedeResponse(Long id, String nombre, String calle, String numero,
                         String entreCalles, String direccionCompleta) {
        this.id = id;
        this.nombre = nombre;
        this.calle = calle;
        this.numero = numero;
        this.entreCalles = entreCalles;
        this.direccionCompleta = direccionCompleta;
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getCalle() { return calle; }
    public String getNumero() { return numero; }
    public String getEntreCalles() { return entreCalles; }
    public String getDireccionCompleta() { return direccionCompleta; }
}
