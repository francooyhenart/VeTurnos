# VeTurnos — Frontend React Native (Expo)

Aplicación móvil para la gestión de turnos veterinarios. Desarrollada con **React Native + Expo** para la materia Desarrollo de Aplicaciones Móviles — UTN Grupo 7.

---

## Árbol de directorios

```
VeTurnos/
├── App.js                          # Punto de entrada
├── app.json                        # Configuración Expo
├── babel.config.js
├── package.json
└── src/
    ├── constants/
    │   └── index.js                # Colores, tipografías, URL base, enums
    ├── context/
    │   └── AuthContext.js          # Estado global de autenticación (Context + AsyncStorage)
    ├── hooks/
    │   └── index.js                # Custom hook useMascotas
    ├── navigation/
    │   └── index.js                # Stack + Tab navigators (cliente / admin)
    ├── services/
    │   └── api.js                  # Capa de servicios REST (axios → Java backend)
    ├── components/
    │   └── ui.js                   # Componentes UI reutilizables
    └── screens/
        ├── SplashScreen.js
        ├── auth/
        │   ├── LoginScreen.js
        │   └── RegistroScreen.js
        ├── cliente/
        │   ├── InicioClienteScreen.js
        │   ├── PerfilModal.js
        │   ├── MascotasScreen.js
        │   ├── NuevaMascotaScreen.js
        │   ├── TurnosScreen.js
        │   └── ReservarTurnoScreen.js
        └── admin/
            └── AgendaAdminScreen.js
```

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Arrancar Expo
npx expo start

# 3. En Android (emulador o dispositivo con Expo Go)
npx expo start --android
```

---

## Configuración del backend

Editá `src/constants/index.js` y actualizá `API_BASE_URL`:

```js
// Para emulador Android (apunta al localhost de la PC)
export const API_BASE_URL = 'http://10.0.2.2:8080/api';

// Para dispositivo físico (reemplazá con la IP local de tu máquina)
export const API_BASE_URL = 'http://192.168.X.X:8080/api';
```

---

## Flujo de navegación

```
Splash
  └─► Login ◄──► Registro
        │
        ├─► (rol = CLIENTE)  → ClienteTabs
        │       ├── Inicio   → PerfilModal (modal)
        │       ├── Mascotas → NuevaMascota
        │       └── Turnos   → ReservarTurno
        │
        └─► (rol = VETERINARIO) → AgendaAdmin → PerfilModal (modal)
```

---

## Endpoints consumidos

| Pantalla | Método | Endpoint |
|---|---|---|
| Registro | POST | `/api/auth/registro` |
| Login | POST | `/api/auth/login` |
| Alta mascota | POST | `/api/mascotas` |
| Listar mascotas | GET | `/api/mascotas/cliente/:id` |
| Crear reserva | POST | `/api/reservas` |
| Cancelar reserva | DELETE | `/api/reservas/:id` |
| Agenda del día | GET | `/api/reservas/agenda?fecha=YYYY-MM-DD` |
| Marcar asistencia | PATCH | `/api/reservas/:id/asistencia?estado=ASISTIDO` |

---

## Stack técnico

- React Native 0.74 + Expo SDK 51
- React Navigation 6 (Stack + Bottom Tabs)
- Axios para HTTP
- AsyncStorage para sesión persistente
- Context API + Hooks para estado global
- StyleSheet nativo (sin librerías de UI externas)
