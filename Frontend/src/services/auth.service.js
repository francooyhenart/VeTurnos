const API_URL = "http://localhost:8080/api/auth";

export const authService = {
  // Inicio de Sesión Real
  login: async (email, password) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Credenciales inválidas");
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem("user", JSON.stringify(data));
    }
    return data;
  },

  // Registro Real (Modificado a /regitro para coincidir con tu Backend)
  registro: async (nombreCompleto, dni, telefono, email, password) => {
    const response = await fetch(`${API_URL}/regitro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombreCompleto, dni, telefono, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al registrar el usuario");
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem("user", JSON.stringify(data));
    }
    return data;
  }
};