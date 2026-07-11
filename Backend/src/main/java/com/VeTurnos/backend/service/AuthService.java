package com.VeTurnos.backend.service;

import com.VeTurnos.backend.dto.AuthResponse;
import com.VeTurnos.backend.dto.GestorRegistroRequest;
import com.VeTurnos.backend.dto.LoginRequest;
import com.VeTurnos.backend.dto.RegistroRequest;
import com.VeTurnos.backend.model.Cliente;
import com.VeTurnos.backend.model.GestorVeterinarios;
import com.VeTurnos.backend.model.Usuario;
import com.VeTurnos.backend.repository.ClienteRepository;
import com.VeTurnos.backend.repository.GestorVeterinarioRepository;
import com.VeTurnos.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final GestorVeterinarioRepository gestorVeterinarioRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UsuarioRepository usuarioRepository, ClienteRepository clienteRepository, 
                      GestorVeterinarioRepository gestorVeterinarioRepository, JwtTokenProvider jwtTokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.gestorVeterinarioRepository = gestorVeterinarioRepository;
        this.jwtTokenProvider = jwtTokenProvider;
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

        // Generar token JWT
        String token = jwtTokenProvider.generateToken(
                clienteGuardado.getId(),
                clienteGuardado.getEmail(),
                clienteGuardado.getRol().name()
        );

        return new AuthResponse(
                clienteGuardado.getId(),
                clienteGuardado.getNombreCompleto(),
                clienteGuardado.getEmail(),
                clienteGuardado.getRol().name(),
                token
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Credenciales incorrectas"));

        // Validación en texto plano para el MVP
        if (!usuario.getPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Mail o Contraseña incorrectas");
        }

        // Generar token JWT
        String token = jwtTokenProvider.generateToken(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getRol().name()
        );

        return new AuthResponse(
                usuario.getId(),
                usuario.getNombreCompleto(),
                usuario.getEmail(),
                usuario.getRol().name(),
                token
        );
    }

    @Transactional
    public AuthResponse registrarGestor(GestorRegistroRequest request) {
        // Validar que sea una clave correcta (opcional pero recomendado para seguridad)
        if (request.getSecretKey() == null || !request.getSecretKey().equals("GestorSecret2025")) {
            throw new IllegalArgumentException("Clave secreta inválida para crear gestores");
        }

        // Validar unicidad de Email
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Ya hay un usuario registrado con ese email");
        }

        // Validar unicidad de DNI
        if (usuarioRepository.existsByDni(request.getDni())) {
            throw new IllegalArgumentException("Ya hay un usuario registrado con ese DNI");
        }

        // Crear número de empleado automático (GEST-timestamp)
        String numeroEmpleado = "GEST-" + System.currentTimeMillis();

        // Crear dominio GestorVeterinarios
        GestorVeterinarios nuevoGestor = new GestorVeterinarios(
                request.getNombreCompleto(),
                request.getDni(),
                request.getTelefono(),
                request.getEmail(),
                request.getPassword(),
                numeroEmpleado
        );

        // Guardar a través del repositorio específico
        GestorVeterinarios gestorGuardado = gestorVeterinarioRepository.save(nuevoGestor);

        // Generar token JWT
        String token = jwtTokenProvider.generateToken(
                gestorGuardado.getId(),
                gestorGuardado.getEmail(),
                gestorGuardado.getRol().name()
        );

        return new AuthResponse(
                gestorGuardado.getId(),
                gestorGuardado.getNombreCompleto(),
                gestorGuardado.getEmail(),
                gestorGuardado.getRol().name(),
                token
        );
    }
}