// ClienteRepository.java

package com.veturnos.backend.repository;

import com.veturnos.backend.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    List<Cliente> findByNombreCompletoContainingIgnoreCase(String nombre);
    List<Cliente> findByDniContaining(String dni);
}