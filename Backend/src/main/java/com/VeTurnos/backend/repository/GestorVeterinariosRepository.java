// GestorVeterinariosRepository.java
package com.VeTurnos.backend.repository;

import com.VeTurnos.backend.model.GestorVeterinarios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GestorVeterinariosRepository extends JpaRepository<GestorVeterinarios, Long> {
    Optional<GestorVeterinarios> findByEmail(String email);
    Optional<GestorVeterinarios> findByNumeroEmpleado(String numeroEmpleado);
}