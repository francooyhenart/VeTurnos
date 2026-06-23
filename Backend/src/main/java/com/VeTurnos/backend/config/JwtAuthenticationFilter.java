package com.VeTurnos.backend.config;

import com.VeTurnos.backend.service.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Filtro para validar tokens JWT en cada request.
 * Se ejecuta una sola vez por request antes de los controladores.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        try {
            // 1. Extraer token del header Authorization
            String authHeader = request.getHeader("Authorization");
            String token = jwtTokenProvider.extractToken(authHeader);

            // 2. Si hay token y es válido, crear autenticación
            if (token != null && jwtTokenProvider.validateToken(token)) {
                // Extraer información del token
                Long userId = jwtTokenProvider.getUserIdFromToken(token);
                String email = jwtTokenProvider.getEmailFromToken(token);
                String rol = jwtTokenProvider.getRolFromToken(token);

                // Crear lista de autoridades (roles)
                List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_" + rol)); // Spring requiere "ROLE_" prefix

                // Crear token de autenticación
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,              // principal (usuario)
                                null,               // credentials (null porque ya fue validado)
                                authorities         // permisos
                        );

                // Establecer en el contexto de seguridad
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

        } catch (Exception e) {
            // Si hay error validando el token, simplemente continuar sin autenticación
            // Spring Security rechazará después si la ruta requiere autenticación
            logger.debug("No se pudo validar el JWT: " + e.getMessage());
        }

        // Continuar con el siguiente filtro
        filterChain.doFilter(request, response);
    }
}
