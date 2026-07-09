// SedeService.java

package com.VeTurnos.backend.service;

import com.VeTurnos.backend.model.Sede;
import com.VeTurnos.backend.repository.ReservaRepository;
import com.VeTurnos.backend.repository.SedeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SedeService {

    private final SedeRepository sedeRepository;
    private final ReservaRepository reservaRepository;
    private final Logger logger = LoggerFactory.getLogger(SedeService.class);

    public SedeService(SedeRepository sedeRepository, ReservaRepository reservaRepository) {
        this.sedeRepository = sedeRepository;
        this.reservaRepository = reservaRepository;
    }

    /**
     * CREATE - Crear nueva sede.
     * Valida que no exista ya otra sede en la misma dirección (calle + número).
     */
    public Sede crearSede(String nombre, String calle, String numero, String entreCalles) {
        try {
            if (sedeRepository.existsByCalleIgnoreCaseAndNumero(calle.trim(), numero.trim())) {
                throw new IllegalArgumentException("Ya existe una sede registrada en esa dirección");
            }
            return sedeRepository.save(new Sede(nombre, calle, numero, entreCalles));
        } catch (IllegalArgumentException e) {
            // Error de validación de negocio esperado: no es un bug, no hace falta loguearlo como error
            throw e;
        } catch (Exception e) {
            // Acá caen fallos reales (columna inexistente, restricción de BD, NPE, etc).
            // Logueamos con el stack trace completo para poder diagnosticar en la terminal del backend.
            logger.error("Error inesperado al crear la sede (nombre='{}', calle='{}', numero='{}'): {}",
                    nombre, calle, numero, e.getMessage(), e);
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    /**
     * READ - Obtener todas las sedes
     */
    @Transactional(readOnly = true)
    public List<Sede> obtenerTodas() {
        return sedeRepository.findAll();
    }

    /**
     * READ - Obtener sede por ID
     */
    @Transactional(readOnly = true)
    public Sede obtenerPorId(Long id) {
        return sedeRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Sede no encontrada con ID: " + id));
    }

    /**
     * DELETE - Eliminar sede.
     * No se permite si tiene turnos asignados (vía veterinarios de esa sede).
     */
    public void eliminarSede(Long id) {
        if (!sedeRepository.existsById(id)) {
            throw new IllegalArgumentException("Sede no encontrada con ID: " + id);
        }
        if (reservaRepository.existeReservaEnSede(id)) {
            throw new IllegalArgumentException("No se puede eliminar la sede porque tiene turnos asignados");
        }
        sedeRepository.deleteById(id);
    }
}
