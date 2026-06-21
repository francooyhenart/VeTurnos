// App.js
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications'; // 🚀 E2: Integración de Hardware Nativo
import { AuthProvider } from './src/context/AuthContext';
import Navegacion from './src/navigation';

// 🚀 E2: Configuración del manejador para que las alertas se muestren incluso con la app abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  
  useEffect(() => {
    async function configurarNotificaciones() {
      // Configuración obligatoria del canal de prioridad para dispositivos Android (API 26+)
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#90C7A1', // Color verde pastel identificatorio de VeTurnos
        });
      }

      // Verificación y solicitud asíncrona de permisos del sistema operativo (US-08)
      const { status: estadoExistente } = await Notifications.getPermissionsAsync();
      let estadoFinal = estadoExistente;
      
      if (estadoExistente !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        estadoFinal = status;
      }
      
      if (estadoFinal !== 'granted') {
        console.log('Permisos de notificaciones locales denegados por el usuario.');
        return;
      }
    }

    configurarNotificaciones();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Navegacion />
      </AuthProvider>
    </SafeAreaProvider>
  );
}