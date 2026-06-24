// ClienteRepository.java

package com.VeTurnos.backend.repository;

import com.VeTurnos.backend.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    List<Cliente> findByNombreCompletoContainingIgnoreCase(String nombre);
    List<Cliente> findByDniContaining(String dni);
}