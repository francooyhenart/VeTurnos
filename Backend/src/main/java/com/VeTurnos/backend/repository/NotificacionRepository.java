package com.veturnos.backend.repository;

import com.veturnos.backend.model.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    // Trae el historial de alertas del usuario (sirve para la campanita del front)
    @Query("SELECT n FROM Notificacion n WHERE n.usuario.id = :usuarioId ORDER BY n.fechaHoraCreacion DESC")
    List<Notificacion> findByUsuarioId(@Param("usuarioId") Long usuarioId);

    // Cuenta cuántas tiene sin leer (para clavar el globito rojo con el número en la UI)
    long countByUsuarioIdAndLeidoFalse(Long usuarioId);
}