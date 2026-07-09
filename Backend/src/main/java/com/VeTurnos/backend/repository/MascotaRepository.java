// MascotaRepository.java

package com.VeTurnos.backend.repository;

import com.VeTurnos.backend.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    List<Mascota> findByDueñoId(Long clienteId);

    // Búsqueda global de pacientes (Veterinario): por nombre de mascota o DNI del dueño
    @Query("SELECT m FROM Mascota m WHERE LOWER(m.nombre) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR m.dueño.dni LIKE CONCAT('%', :query, '%')")
    List<Mascota> buscarPorNombreOMascotaDniDueno(@Param("query") String query);
}