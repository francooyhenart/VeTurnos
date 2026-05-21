package com.veturnos.backend.repository;

import com.veturnos.backend.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    List<Mascota> findByDueñoId(Long clienteId);
}