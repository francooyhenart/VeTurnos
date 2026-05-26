// src/navigation/index.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

import { useAuth } from '../context/AuthContext';
import { COLORS, FONT_SIZE, SPACING, ROLES } from '../constants';
import { CargandoPantalla } from '../components/ui';

// Pantallas de autenticación
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegistroScreen from '../screens/auth/RegistroScreen';

// Pantallas de cliente
import InicioClienteScreen from '../screens/cliente/InicioClienteScreen';
import MascotasScreen from '../screens/cliente/MascotasScreen';
import NuevaMascotaScreen from '../screens/cliente/NuevaMascotaScreen';
import TurnosScreen from '../screens/cliente/TurnosScreen';
import ReservarTurnoScreen from '../screens/cliente/ReservarTurnoScreen';
import PerfilModal from '../screens/cliente/PerfilModal';

// Pantallas de admin/vet
import AgendaAdminScreen from '../screens/admin/AgendaAdminScreen';
import CrearTurnoAdminScreen from '../screens/admin/CrearTurnoAdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Ícono de Tab ─────────────────────────────────────────────
const TabIcon = ({ label, focused }) => (
  <View style={tabEstilos.iconoContenedor}>
    <Text style={[tabEstilos.iconoLabel, focused && tabEstilos.iconoLabelActivo]}>
      {label}
    </Text>
    {focused && <View style={tabEstilos.iconoDot} />}
  </View>
);

// ─── Tab Navigator para Cliente ───────────────────────────────
const ClienteTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: tabEstilos.tabBar,
      tabBarShowLabel: false,
    }}
  >
    <Tab.Screen
      name="Inicio"
      component={InicioClienteScreen}
      options={{
        tabBarButton: (props) => (
          <TouchableOpacity {...props} style={tabEstilos.tabButton}>
            <TabIcon label="Inicio" focused={props.accessibilityState?.selected} />
          </TouchableOpacity>
        ),
      }}
    />
    <Tab.Screen
      name="Mascotas"
      component={MascotasStack}
      options={{
        tabBarButton: (props) => (
          <TouchableOpacity {...props} style={tabEstilos.tabButton}>
            <TabIcon label="Mascotas" focused={props.accessibilityState?.selected} />
          </TouchableOpacity>
        ),
      }}
    />
    <Tab.Screen
      name="Turnos"
      component={TurnosStack}
      options={{
        tabBarButton: (props) => (
          <TouchableOpacity {...props} style={tabEstilos.tabButton}>
            <TabIcon label="Turnos" focused={props.accessibilityState?.selected} />
          </TouchableOpacity>
        ),
      }}
    />
  </Tab.Navigator>
);

// ─── Stack de Mascotas ────────────────────────────────────────
const MascotasStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ListaMascotas" component={MascotasScreen} />
    <Stack.Screen name="NuevaMascota" component={NuevaMascotaScreen} />
  </Stack.Navigator>
);

// ─── Stack de Turnos ──────────────────────────────────────────
const TurnosStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MisTurnos" component={TurnosScreen} />
    <Stack.Screen name="ReservarTurno" component={ReservarTurnoScreen} />
  </Stack.Navigator>
);

// ─── Navegador raíz ───────────────────────────────────────────
const Navegacion = () => {
  const { usuario, cargando } = useAuth();

  if (cargando) return <CargandoPantalla />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!usuario ? (
          // Flujo de autenticación
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Registro" component={RegistroScreen} />
          </>
        ) : usuario.rol === ROLES.VETERINARIO ? (
          // Flujo de administrador/veterinario
          <>
            <Stack.Screen name="AgendaAdmin" component={AgendaAdminScreen} />
            <Stack.Screen
              name="PerfilModal"
              component={PerfilModal}
              options={{ presentation: 'modal' }}
            />
            {/* Se agrega la pantalla de creación al stack de veterinario */}
            <Stack.Screen name="CrearTurnoAdmin" component={CrearTurnoAdminScreen} />
          </>
        ) : (
          // Flujo de cliente
          <>
            <Stack.Screen name="ClienteTabs" component={ClienteTabs} />
            <Stack.Screen
              name="PerfilModal"
              component={PerfilModal}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const tabEstilos = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 0,
    height: 64,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.sm,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  iconoContenedor: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconoLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  iconoLabelActivo: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  iconoDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 3,
  },
});

export default Navegacion;