// SedeRepository.java

package com.veturnos.backend.repository;

import com.veturnos.backend.model.Sede;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SedeRepository extends JpaRepository<Sede, Long> {
    // Punto 4: evitar dar de alta dos sedes en la misma dirección (calle + número)
    boolean existsByCalleIgnoreCaseAndNumero(String calle, String numero);
}
