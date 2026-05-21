package com.veturnos.backend.service;

import com.veturnos.backend.dto.AuthResponse;
import com.veturnos.backend.dto.LoginRequest;
import com.veturnos.backend.dto.RegistroRequest;
import com.veturnos.backend.model.Cliente;
import com.veturnos.backend.model.Usuario;
import com.veturnos.backend.repository.ClienteRepository;
import com.veturnos.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;

    public AuthService(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
    }

    @Transactional
    public AuthResponse registrarCliente(RegistroRequest request) {
        // Validar unicidad de Email
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Ya hay un usuario registrado con ese email");
        }

        // Validar unicidad de DNI
        if (usuarioRepository.existsByDni(request.getDni())) {
            throw new IllegalArgumentException("Ya hay un usuario registrado con ese DNI");
        }

        // Crear dominio Cliente (asigna Rol.CLIENTE internamente en su constructor)
        Cliente nuevoCliente = new Cliente(
                request.getNombreCompleto(),
                request.getDni(),
                request.getTelefono(),
                request.getEmail(),
                request.getPassword() // Texto plano para el MVP
        );

        // Guardar a través del repositorio específico
        Cliente clienteGuardado = clienteRepository.save(nuevoCliente);

        return new AuthResponse(
                clienteGuardado.getId(),
                clienteGuardado.getNombreCompleto(),
                clienteGuardado.getEmail(),
                clienteGuardado.getRol().name()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales incorrectas"));

        // Validación en texto plano para el MVP
        if (!usuario.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Credenciales incorrectas");
        }

        return new AuthResponse(
                usuario.getId(),
                usuario.getNombreCompleto(),
                usuario.getEmail(),
                usuario.getRol().name()
        );
    }
}