package com.VeTurnos.backend.service;

import com.VeTurnos.backend.dto.MascotaRequest;
import com.VeTurnos.backend.dto.MascotaResponse;
import com.VeTurnos.backend.enums.Especie;
import com.VeTurnos.backend.model.Cliente;
import com.VeTurnos.backend.model.Mascota;
import com.VeTurnos.backend.repository.ClienteRepository;
import com.VeTurnos.backend.repository.MascotaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MascotaServiceTest {

    @Mock
    private MascotaRepository mascotaRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @InjectMocks
    private MascotaService mascotaService;

    @Test
    void altaMascotaDebeGuardarLaFotoEnLaMascota() {
        Cliente cliente = new Cliente("Ana", "12345678", "1122334455", "ana@test.com", "password123");

        MascotaRequest request = new MascotaRequest();
        request.setNombre("Milo");
        request.setEspecie("PERRO");
        request.setRaza("Maltés");
        request.setEdad(3);
        request.setClienteId(1L);
        request.setFoto("data:image/jpeg;base64,abc123");

        Mascota mascotaPersistida = new Mascota("Milo", Especie.PERRO, "Maltés", 3, cliente);
        mascotaPersistida.setFoto("data:image/jpeg;base64,abc123");

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(mascotaRepository.save(any(Mascota.class))).thenReturn(mascotaPersistida);

        MascotaResponse response = mascotaService.altaMascota(request);

        assertEquals("data:image/jpeg;base64,abc123", response.getFoto());
    }

    @Test
    void altaMascotaDebeAceptarRazaVaciaSinRomperElGuardado() {
        Cliente cliente = new Cliente("Ana", "12345678", "1122334455", "ana@test.com", "password123");

        MascotaRequest request = new MascotaRequest();
        request.setNombre("Milo");
        request.setEspecie("PERRO");
        request.setRaza("");
        request.setEdad(2);
        request.setClienteId(1L);

        Mascota mascotaPersistida = new Mascota("Milo", Especie.PERRO, "", 2, cliente);

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(mascotaRepository.save(any(Mascota.class))).thenReturn(mascotaPersistida);

        assertDoesNotThrow(() -> mascotaService.altaMascota(request));
    }
}
