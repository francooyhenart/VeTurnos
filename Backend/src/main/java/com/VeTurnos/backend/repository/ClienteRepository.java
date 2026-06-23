// ClienteRepository.java

package com.VeTurnos.backend.repository;

import com.VeTurnos.backend.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
} 