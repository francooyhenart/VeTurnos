// SedeRepository.java

package com.VeTurnos.backend.repository;

import com.VeTurnos.backend.model.Sede;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SedeRepository extends JpaRepository<Sede, Long> {
    // Punto 4: evitar dar de alta dos sedes en la misma dirección (calle + número)
    boolean existsByCalleIgnoreCaseAndNumero(String calle, String numero);
}
