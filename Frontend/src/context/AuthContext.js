// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const USER_KEY = '@veturnos_user';

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al iniciar, revisar si hay sesión guardada
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const datos = await AsyncStorage.getItem(USER_KEY);
        if (datos) {
          setUsuario(JSON.parse(datos));
        }
      } catch (_) {
        // Si falla la lectura, simplemente no hay sesión
      } finally {
        setCargando(false);
      }
    };
    cargarSesion();
  }, []);

  const iniciarSesion = useCallback(async (datosUsuario) => {
    setUsuario(datosUsuario);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(datosUsuario));
  }, []);

  const cerrarSesion = useCallback(async () => {
    setUsuario(null);
    await AsyncStorage.removeItem(USER_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
