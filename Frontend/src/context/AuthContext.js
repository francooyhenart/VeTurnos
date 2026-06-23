// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

const USER_KEY = '@veturnos_user';
const TOKEN_KEY = '@veturnos_token';

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al iniciar, revisar si hay sesión guardada
  useEffect(() => {
    const cargarSesion = async () => {
      try {
        const datosUsuario = await AsyncStorage.getItem(USER_KEY);
        const datosToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (datosUsuario) {
          setUsuario(JSON.parse(datosUsuario));
        }
        if (datosToken) {
          setToken(datosToken);
        }
      } catch (_) {
        // Si falla la lectura, simplemente no hay sesión
      } finally {
        setCargando(false);
      }
    };
    cargarSesion();
  }, []);

  const iniciarSesion = useCallback(async (datosUsuario, tokenJwt) => {
    setUsuario(datosUsuario);
    setToken(tokenJwt);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(datosUsuario));
    await AsyncStorage.setItem(TOKEN_KEY, tokenJwt);
  }, []);

  const cerrarSesion = useCallback(async () => {
    setUsuario(null);
    setToken(null);
    await AsyncStorage.removeItem(USER_KEY);
    await AsyncStorage.removeItem(TOKEN_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
