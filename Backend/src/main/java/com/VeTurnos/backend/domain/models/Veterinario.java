package com.VeTurnos.backend.domain.models;

public class Veterinario extends Usuario {
    private String matricula;
    private String especialidad; //Ej: "Medicina General", "Cirugía", etc.
    //la especialidad podria ser enum.
    private Boolean esAdministrador; //Si es true es admin, mas adelante si tengo mas administradores les pongo false y pasan a ser solo veterinarios.
}