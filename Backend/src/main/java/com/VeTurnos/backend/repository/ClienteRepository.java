// ClienteRepository.java

package com.veturnos.backend.repository;

import com.veturnos.backend.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
} 