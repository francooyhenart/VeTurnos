package com.veturnos.backend.config;

import com.veturnos.backend.service.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(java.util.Arrays.asList("http://localhost:*", "http://127.0.0.1:*", "http://10.0.2.2:*"));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource, JwtTokenProvider jwtTokenProvider) throws Exception {
        http.addFilterBefore(
                new JwtAuthenticationFilter(jwtTokenProvider),
                UsernamePasswordAuthenticationFilter.class
        );

        http
            .cors().configurationSource(corsConfigurationSource)
            .and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/registro").permitAll()
                
                // Rutas públicas
                .requestMatchers("/api/auth/**").permitAll()
                
                // Listado de veterinarios: además del gestor, lo necesitan el Cliente (elegir
                // vet al reservar) y el Veterinario (dropdown al cargar un turno). El resto de
                // las rutas administrativas (alta, baja, edición, stats) siguen restringidas abajo.
                .requestMatchers(HttpMethod.GET, "/api/admin/veterinarios")
                    .hasAnyAuthority("GESTOR_VETERINARIOS", "ADMIN", "VETERINARIO", "CLIENTE")

                // Rutas administrativas (corregido a hasAnyAuthority para evitar problemas con prefijo ROLE_)
                .requestMatchers("/api/admin/veterinarios/**").hasAnyAuthority("GESTOR_VETERINARIOS", "ADMIN")
                
                // Rutas para VETERINARIO
                .requestMatchers(HttpMethod.GET, "/api/veterinarios/agenda/**").hasAuthority("VETERINARIO")
                
                // Rutas para CLIENTE
                .requestMatchers(HttpMethod.GET, "/api/mascotas/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/mascotas/**").hasAuthority("CLIENTE")
                .requestMatchers(HttpMethod.PUT, "/api/mascotas/**").hasAuthority("CLIENTE")
                .requestMatchers(HttpMethod.DELETE, "/api/mascotas/**").hasAuthority("CLIENTE")

                // Busqueda de clientes (solo gestor)
                .requestMatchers(HttpMethod.GET, "/api/clientes/**").hasAuthority("GESTOR_VETERINARIOS")

                // Rutas de RESERVAS - gestor y veterinario pueden ver agendas
                .requestMatchers(HttpMethod.GET, "/api/reservas/veterinario/**").hasAnyAuthority("GESTOR_VETERINARIOS", "VETERINARIO")
                .requestMatchers(HttpMethod.GET, "/api/reservas/agenda").hasAnyAuthority("GESTOR_VETERINARIOS", "VETERINARIO", "CLIENTE")
                .requestMatchers(HttpMethod.PATCH, "/api/reservas/**").hasAnyAuthority("GESTOR_VETERINARIOS", "VETERINARIO")
                .requestMatchers(HttpMethod.POST, "/api/reservas/**").hasAnyAuthority("CLIENTE", "GESTOR_VETERINARIOS", "VETERINARIO")
                .requestMatchers(HttpMethod.DELETE, "/api/reservas/**").hasAnyAuthority("CLIENTE", "GESTOR_VETERINARIOS")
                
                .anyRequest().authenticated();

        return http.build();
    }
}