// ObservacionesClinicasRequest.java
package com.veturnos.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ObservacionesClinicasRequest {

    @NotBlank(message = "Las observaciones no pueden estar vacías")
    @Size(max = 2000, message = "Las observaciones no pueden superar los 2000 caracteres")
    private String observacionesClinicas;

    public String getObservacionesClinicas() { return observacionesClinicas; }
}
