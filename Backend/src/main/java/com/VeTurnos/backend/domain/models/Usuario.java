package com.VeTurnos.backend.domain.models;

import com.VeTurnos.backend.domain.enums.Rol;

public abstract class Usuario {
    private Long id;
    private String nombreCompleto;
    private String dni;
    private String telefono;
    private String email;
    private String password; //Lo escribi en ingles para que no haya problemas con la enie.
    private Rol rol; //"CLIENTE" o "ADMIN"

    // Getters, Setters y Constructores
}