package com.veturnos.backend.repository;

import com.veturnos.backend.model.Veterinario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VeterinarioRepository extends JpaRepository<Veterinario, Long> {
    Optional<Veterinario> findByMatricula(String matricula);
}