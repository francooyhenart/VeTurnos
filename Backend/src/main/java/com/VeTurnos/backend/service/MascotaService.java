package com.VeTurnos.backend.service;

import com.VeTurnos.backend.dto.MascotaRequest;
import com.VeTurnos.backend.dto.MascotaResponse;
import com.VeTurnos.backend.enums.Especie;
import com.VeTurnos.backend.model.Cliente;
import com.VeTurnos.backend.model.Mascota;
import com.VeTurnos.backend.repository.ClienteRepository;
import com.VeTurnos.backend.repository.MascotaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MascotaService {

    private final MascotaRepository mascotaRepository;
    private final ClienteRepository clienteRepository;

    public MascotaService(MascotaRepository mascotaRepository, ClienteRepository clienteRepository) {
        this.mascotaRepository = mascotaRepository;
        this.clienteRepository = clienteRepository;
    }

    @Transactional
    public MascotaResponse altaMascota(MascotaRequest request) {
        // 1. Validar que el cliente exista
        Cliente dueño = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new IllegalArgumentException("El cliente especificado no existe"));

        // 2. Validar y convertir la especie del String al Enum
        Especie especieEnum;
        try {
            especieEnum = Especie.valueOf(request.getEspecie().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("La especie especificada no es válida");
        }

        // 3. Crear la entidad de dominio pasándole el dueño (JPA se encarga de la FK)
        Mascota nuevaMascota = new Mascota(
                request.getNombre(),
                especieEnum,
                request.getRaza(),
                request.getEdad(), // Puede ir null sin problemas
                dueño
        );

        // 4. Guardar en la base de datos
        Mascota mascotaGuardada = mascotaRepository.save(nuevaMascota);

        return mapperAResponse(mascotaGuardada);
    }

    @Transactional(readOnly = true)
    public List<MascotaResponse> listarMascotasPorCliente(Long clienteId) {
        // Validamos si el cliente existe para tirar un error limpio si mandan un ID cualquiera
        if (!clienteRepository.existsById(clienteId)) {
            throw new IllegalArgumentException("El cliente especificado no existe");
        }

        List<Mascota> mascotas = mascotaRepository.findByDueñoId(clienteId);

        return mascotas.stream()
                .map(this::mapperAResponse)
                .collect(Collectors.toList());
    }

    // Método helper para no repetir el mapeo
    private MascotaResponse mapperAResponse(Mascota mascota) {
        return new MascotaResponse(
                mascota.getId(),
                mascota.getNombre(),
                mascota.getEspecie().name(),
                mascota.getRaza(),
                mascota.getEdad(),
                mascota.getDueño().getId()
        );
    }
}