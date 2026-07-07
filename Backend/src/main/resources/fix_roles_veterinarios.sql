-- =============================================================================
-- fix_roles_veterinarios.sql
--
-- PROBLEMA:
--   Los usuarios veterinarios fueron creados en la tabla 'usuarios' con el valor
--   de rol incorrecto ('GESTOR_VETERINARIOS') en lugar de 'VETERINARIO'.
--   Esto provoca que al iniciar sesión, el frontend los redirija al stack del
--   Gestor en lugar del stack del Veterinario.
--
-- CAUSA:
--   Probablemente generado por una versión anterior del código donde el
--   constructor de la entidad Veterinario asignaba un rol incorrecto,
--   o por una inserción manual errónea en la base de datos.
--
-- SOLUCIÓN:
--   Normalizar el campo 'rol' en la tabla 'usuarios' para todas las filas que
--   tengan una entrada correspondiente en la tabla 'veterinarios'.
--
-- APLICAR EN: Supabase → SQL Editor
-- =============================================================================


-- -----------------------------------------------------------------------------
-- PASO 1: Verificar el estado actual
--   Muestra todos los usuarios que tienen una fila en 'veterinarios',
--   junto con el rol que tienen actualmente en 'usuarios'.
--   Se espera que las filas problemáticas muestren 'GESTOR_VETERINARIOS'.
-- -----------------------------------------------------------------------------
SELECT
    u.id,
    u.email,
    u.nombre_completo,
    u.rol         AS rol_actual,
    v.matricula,
    v.especialidad
FROM usuarios u
INNER JOIN veterinarios v ON v.usuario_id = u.id
ORDER BY u.id;


-- -----------------------------------------------------------------------------
-- PASO 2: Corregir los roles incorrectos
--   Actualiza a 'VETERINARIO' únicamente las filas de 'usuarios' que:
--     a) Tienen una entrada en la tabla 'veterinarios' (son realmente vets).
--     b) No tienen ya el rol correcto (evita writes innecesarios).
-- -----------------------------------------------------------------------------
UPDATE usuarios
SET rol = 'VETERINARIO'
WHERE id IN (
    SELECT usuario_id
    FROM veterinarios
)
AND rol != 'VETERINARIO';


-- -----------------------------------------------------------------------------
-- PASO 3: Confirmar que el fix fue aplicado correctamente
--   Volver a correr la consulta del PASO 1. Todas las filas deben
--   mostrar rol_actual = 'VETERINARIO'.
-- -----------------------------------------------------------------------------
SELECT
    u.id,
    u.email,
    u.nombre_completo,
    u.rol         AS rol_corregido,
    v.matricula,
    v.especialidad
FROM usuarios u
INNER JOIN veterinarios v ON v.usuario_id = u.id
ORDER BY u.id;
