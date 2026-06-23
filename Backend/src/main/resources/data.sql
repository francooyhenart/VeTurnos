-- 1. Insertar Usuarios de Prueba (Solo con roles 'ADMIN' descartado, usamos 'VETERINARIO' y 'CLIENTE')
-- Administrador General (Es un Veterinario con campo es_administrador en TRUE)
INSERT INTO usuarios (id, email, password, nombre_completo, rol, dni, telefono)
VALUES (1, 'admin@veturnos.com', 'admin123', 'Maca Romero Admin', 'VETERINARIO', '1111', '2210001');
INSERT INTO veterinarios (usuario_id, matricula, es_administrador, especialidad)
VALUES (1, 'MP-ADMIN-01', true, 'Administración General');

-- Veterinario Clínico Normal (es_administrador en FALSE)
INSERT INTO usuarios (id, email, password, nombre_completo, rol, dni, telefono)
VALUES (2, 'javier@veturnos.com', 'vet123', 'Dr. Javier Pérez', 'VETERINARIO', '2222', '2210002');
INSERT INTO veterinarios (usuario_id, matricula, es_administrador, especialidad)
VALUES (2, 'MP-5432', false, 'Clínica General');

INSERT INTO usuarios (id, email, password, nombre_completo, rol, dni, telefono)
VALUES (3, 'clara@veturnos.com', 'vet123', 'Dra. Clara Gomez', 'VETERINARIO', '3333', '2210003');
INSERT INTO veterinarios (usuario_id, matricula, es_administrador, especialidad)
VALUES (3, 'MP-6789', false, 'Fisiatría');

-- Cliente Regular
INSERT INTO usuarios (id, email, password, nombre_completo, rol, dni, telefono)
VALUES (4, 'cliente@gmail.com', 'user123', 'Juan Carlos', 'CLIENTE', '4444', '2215551234');
INSERT INTO clientes (usuario_id)
VALUES (4);

-- 2. Insertar Mascotas asociadas al cliente (Juan Carlos - id 4)
INSERT INTO mascotas (id, nombre, especie, raza, edad, cliente_id)
VALUES (1, 'Firulais', 'PERRO', 'Golden Retriever', 3, 4);

INSERT INTO mascotas (id, nombre, especie, raza, edad, cliente_id)
VALUES (2, 'Michi', 'GATO', 'Siamés', 2, 4);

-- 3. Insertar Reservas/Turnos de prueba para la Agenda
-- Un turno pendiente para hoy con el Dr. Javier Pérez (id 2) para Firulais (id 1)
INSERT INTO reservas (id, fecha_hora, duracion_minutos, estado, motivo, cliente_id, mascota_id, veterinario_id, observaciones)
VALUES (1, CURRENT_TIMESTAMP, 30, 'PENDIENTE', 'Vacunación Anual Quinta', 4, 1, 2, NULL);

-- Un turno ya completado con la Dra. Clara (id 3) que ya tiene Ficha Médica
INSERT INTO reservas (id, fecha_hora, duracion_minutos, estado, motivo, cliente_id, mascota_id, veterinario_id, observaciones)
VALUES (2, CURRENT_TIMESTAMP, 30, 'COMPLETADO', 'Control de otitis', 4, 2, 3, 'Se receta limpieza ótica diaria con solución antiséptica por 7 días. Controlar evolución.');