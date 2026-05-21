// La URL base de tu backend de Spring Boot (definida en el Paso 1)
const API_URL = "http://localhost:8080/api/auth";

export const authService = {
  // 1. Función para iniciar sesión
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // Si la respuesta no es OK (ej. un 401 de credenciales incorrectas), lanzamos el error
    if (!response.ok) {
      throw new Error(data.error || "Error al iniciar sesión");
    }

    // Si salió bien, guardamos el AuthResponse en el localStorage
    if (data.id) {
      localStorage.setItem("user", JSON.stringify(data));
    }
    return data;
  },

  // 2. Función para registrar un nuevo cliente
  registro: async (nombreCompleto, dni, telefono, email, password) => {
    const response = await fetch(`${API_URL}/registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombreCompleto, dni, telefono, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error al registrarse");
    }

    // También lo logueamos automáticamente guardando sus datos al registrarse
    if (data.id) {
      localStorage.setItem("user", JSON.stringify(data));
    }
    return data;
  },

  // 3. Función para cerrar sesión
  logout: () => {
    localStorage.removeItem("user");
  },

  // 4. Función helper para obtener el usuario actual desde cualquier parte de la app
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("user"));
  }
};