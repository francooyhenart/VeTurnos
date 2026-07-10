// src/hooks/useAuth.js
export { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────
// src/hooks/useMascotas.js
// ─────────────────────────────────────────────────────────────
import { useState, useCallback } from 'react';
import { listarMascotasPorCliente, registrarMascota } from '../services/api';

export const useMascotas = (clienteId) => {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const cargarMascotas = useCallback(async () => {
    if (!clienteId) return;
    setCargando(true);
    setError(null);
    try {
      const data = await listarMascotasPorCliente(clienteId);
      setMascotas(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [clienteId]);

  const agregarMascota = useCallback(async (formData) => {
    const nueva = await registrarMascota({ ...formData, clienteId });
    const mascotaConFoto = {
      ...nueva,
      foto: nueva?.foto || formData?.foto || null,
    };
    setMascotas((prev) => [...prev, mascotaConFoto]);
    return mascotaConFoto;
  }, [clienteId]);

  return { mascotas, cargando, error, cargarMascotas, agregarMascota };
};
