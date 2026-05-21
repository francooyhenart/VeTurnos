package com.VeTurnos.backend.domain.models;

import com.VeTurnos.backend.domain.enums.Especie;

public class Mascota {
    private Long id;
    private String nombre;
    private Especie especie; //Verificar que no me falte ningun animal tipico.
    private String raza; //Tambien podria ser enum. (Este es super complejo porq puede haber muchisimas razaas dependiendo el animal, por ahi consigo alguna api, sino la dejo string)
    private Integer edad;
    private Long clienteId;

    //Getters, Setters y Constructores
}