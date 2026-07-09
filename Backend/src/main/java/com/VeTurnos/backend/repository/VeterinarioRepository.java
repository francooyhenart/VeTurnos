// VeterinarioRepository.java

package com.VeTurnos.backend.repository;

import com.VeTurnos.backend.model.Veterinario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VeterinarioRepository extends JpaRepository<Veterinario, Long> {
    Optional<Veterinario> findByMatricula(String matricula);
    Optional<Veterinario> findByEmail(String email);
    List<Veterinario> findByActivoTrue();
} 