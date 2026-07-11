package com.veturnos.backend.controller;

import com.veturnos.backend.model.Cliente;
import com.veturnos.backend.repository.ClienteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;

    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @GetMapping("/buscar")
    public ResponseEntity<?> buscar(@RequestParam String q) {
        if (q == null || q.trim().length() < 2) {
            return ResponseEntity.ok(Collections.emptyList());
        }

        List<Cliente> porNombre = clienteRepository.findByNombreCompletoContainingIgnoreCase(q.trim());
        List<Cliente> porDni = clienteRepository.findByDniContaining(q.trim());

        Set<Long> vistos = new HashSet<>();
        List<Map<String, Object>> resultado = new ArrayList<>();

        for (Cliente c : porNombre) {
            if (vistos.add(c.getId())) resultado.add(mapear(c));
        }
        for (Cliente c : porDni) {
            if (vistos.add(c.getId())) resultado.add(mapear(c));
        }

        return ResponseEntity.ok(resultado);
    }

    private Map<String, Object> mapear(Cliente c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("nombreCompleto", c.getNombreCompleto());
        m.put("dni", c.getDni());
        m.put("email", c.getEmail());
        return m;
    }
}
