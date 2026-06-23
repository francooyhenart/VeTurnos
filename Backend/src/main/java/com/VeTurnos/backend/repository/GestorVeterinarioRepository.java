package com.VeTurnos.backend.repository;

import com.VeTurnos.backend.model.GestorVeterinarios;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GestorVeterinarioRepository extends JpaRepository<GestorVeterinarios, Long> {
}
