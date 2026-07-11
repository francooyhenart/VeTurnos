package com.veturnos.backend.repository;

import com.veturnos.backend.model.GestorVeterinarios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GestorVeterinarioRepository extends JpaRepository<GestorVeterinarios, Long> {
}
