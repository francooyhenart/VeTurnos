-- 1. Insertar Usuarios de Prueba (Admin, Veterinarios y Clientes van acá si usan herencia o tabla única)
-- Administrador General (Rol 'ADMIN')
INSERT INTO usuarios (id, email, password, nombre_completo, rol) 
VALUES (1, 'admin@veturnos.com', 'admin123', 'Maca Romero Admin', 'ADMIN') ON CONFLICT DO NOTHING;

-- Veterinarios Clínicos (Tabla veterinarios)
INSERT INTO veterinarios (id, email, password, nombre_completo, rol, especialidad, matricula) 
VALUES (2, 'javier@veturnos.com', 'vet123', 'Dr. Javier Pérez', 'VETERINARIO', 'Clínica General', 'MP-5432') ON CONFLICT DO NOTHING;

INSERT INTO veterinarios (id, email, password, nombre_completo, rol, especialidad, matricula) 
VALUES (3, 'clara@veturnos.com', 'vet123', 'Dra. Clara Gomez', 'VETERINARIO', 'Fisiatría', 'MP-6789') ON CONFLICT DO NOTHING;

-- Clientes (Tabla clientes)
INSERT INTO clientes (id, email, password, nombre_completo, rol, telefono) 
VALUES (4, 'cliente@gmail.com', 'user123', 'Juan Carlos', 'CLIENTE', '2215551234') ON CONFLICT DO NOTHING;

-- 2. Insertar Mascotas asociadas al cliente (Juan Carlos - id 4)
INSERT INTO mascotas (id, nombre, especie, raza, edad, duenio_id) 
VALUES (1, 'Firulais', 'Perro', 'Golden Retriever', 3, 4) ON CONFLICT DO NOTHING;

INSERT INTO mascotas (id, nombre, especie, raza, edad, duenio_id) 
VALUES (2, 'Michi', 'Gato', 'Siamés', 2, 4) ON CONFLICT DO NOTHING;

-- 3. Insertar Reservas/Turnos de prueba para la Agenda
-- Un turno pendiente para hoy con el Dr. Javier Pérez (id 2) para Firulais (id 1)
INSERT INTO reservas (id, fecha_hora, duracion_minutos, estado, motivo, cliente_id, mascota_id, veterinario_id, observaciones) 
VALUES (1, CURRENT_TIMESTAMP, 30, 'PENDIENTE', 'Vacunación Anual Quinta', 4, 1, 2, NULL) ON CONFLICT DO NOTHING;

-- Un turno ya completado con la Dra. Clara (id 3) que ya tiene Ficha Médica
INSERT INTO reservas (id, fecha_hora, duracion_minutos, estado, motivo, cliente_id, mascota_id, veterinario_id, observaciones) 
VALUES (2, CURRENT_TIMESTAMP, 30, 'COMPLETADO', 'Control de otitis', 4, 2, 3, 'Se receta limpieza ótica diaria con solución antiséptica por 7 días. Controlar evolución.') ON CONFLICT DO NOTHING;