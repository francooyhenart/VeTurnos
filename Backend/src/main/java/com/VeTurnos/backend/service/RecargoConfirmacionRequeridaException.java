// src/main/java/com/VeTurnos/backend/service/RecargoConfirmacionRequeridaException.java
package com.VeTurnos.backend.service;

// Si la cancelacion fue con menos de 24 horas se lanza la exception.
public class RecargoConfirmacionRequeridaException extends RuntimeException {
    public RecargoConfirmacionRequeridaException(String mensaje) {
        super(mensaje);
    }
}