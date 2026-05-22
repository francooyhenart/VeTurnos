import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

const Registro = () => {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Nuevo campo para validar coincidencia
  
  const [error, setError] = useState(""); // Errores del Backend
  const [errores, setErrores] = useState({}); // Errores del Frontend

  const navigate = useNavigate();

  // Función de validación del Frontend
  const validarFormulario = () => {
    const nuevosErrores = {};
    
    // 1. Validar Nombre Completo
    if (!nombreCompleto.trim()) {
      nuevosErrores.nombreCompleto = "El nombre completo es obligatorio.";
    } else if (nombreCompleto.trim().length < 4) {
      nuevosErrores.nombreCompleto = "Ingresá un nombre y apellido válido (mínimo 4 caracteres).";
    }

    // 2. Validar DNI (Solo números, entre 7 y 8 dígitos)
    const regexDni = /^\d{7,8}$/;
    if (!dni.trim()) {
      nuevosErrores.dni = "El DNI es obligatorio.";
    } else if (!regexDni.test(dni.trim())) {
      nuevosErrores.dni = "El DNI debe tener entre 7 y 8 dígitos numéricos (sin puntos ni espacios).";
    }

    // 3. Validar Teléfono (Solo números, mínimo 10 dígitos para incluir código de área)
    const regexTelefono = /^\d{10,15}$/;
    if (!telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es obligatorio.";
    } else if (!regexTelefono.test(telefono.trim())) {
      nuevosErrores.telefono = "Ingresá un número válido con código de área (mínimo 10 dígitos, ej: 2215551234).";
    }

    // 4. Validar Correo Electrónico
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      nuevosErrores.email = "El correo electrónico es obligatorio.";
    } else if (!regexEmail.test(email)) {
      nuevosErrores.email = "Ingresá un formato de correo válido (ejemplo@mascota.com).";
    }

    // 5. Validar Contraseña (Mínimo 6 letras/números)
    if (!password) {
      nuevosErrores.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      nuevosErrores.password = "La contraseña debe contener al menos 6 caracteres.";
    }

    // 6. Validar Confirmación de Contraseña
    if (!confirmPassword) {
      nuevosErrores.confirmPassword = "Por favor, confirmá tu contraseña.";
    } else if (password !== confirmPassword) {
      nuevosErrores.confirmPassword = "Las contraseñas no coinciden. Verificá el texto.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Si el front encuentra errores, frena el flujo acá
    if (!validarFormulario()) return;

    try {
      // Conexión real con el backend
      await authService.registro(nombreCompleto, dni, telefono, email, password);
      alert("¡Cuenta creada con éxito!");
      navigate("/mis-turnos");
    } catch (err) {
      setError(err.message || "Error al intentar registrar el usuario.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-sm border-0 border-top border-4 border-success p-4 bg-light bg-opacity-75">
            
            <div className="text-center mb-4">
              <h3 className="fw-bold text-success mb-1">🐾 Unirse a VeTurnos</h3>
              <p className="text-muted small">Registrate para gestionar las consultas de tus mascotas</p>
            </div>

            {error && <div className="alert alert-danger shadow-sm py-2 small">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              
              {/* Nombre Completo */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary">
                  <i className="bi bi-person-badge-fill me-1 text-success"></i> Nombre Completo
                </label>
                <input
                  type="text"
                  className={`form-control ${errores.nombreCompleto ? "is-invalid" : ""}`}
                  placeholder="Juan Pérez"
                  value={nombreCompleto}
                  onChange={(e) => {
                    setNombreCompleto(e.target.value);
                    if (errores.nombreCompleto) setErrores({ ...errores, nombreCompleto: "" });
                  }}
                  required
                />
                {errores.nombreCompleto && <div className="invalid-feedback">{errores.nombreCompleto}</div>}
              </div>

              {/* Fila DNI y Teléfono */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-secondary">
                    <i className="bi bi-card-text me-1 text-success"></i> DNI
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errores.dni ? "is-invalid" : ""}`}
                    placeholder="12345678"
                    value={dni}
                    onChange={(e) => {
                      setDni(e.target.value);
                      if (errores.dni) setErrores({ ...errores, dni: "" });
                    }}
                    required
                  />
                  {errores.dni && <div className="invalid-feedback">{errores.dni}</div>}
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-secondary">
                    <i className="bi bi-telephone-fill me-1 text-success"></i> Teléfono
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errores.telefono ? "is-invalid" : ""}`}
                    placeholder="2215551234"
                    value={telefono}
                    onChange={(e) => {
                      setTelefono(e.target.value);
                      if (errores.telefono) setErrores({ ...errores, telefono: "" });
                    }}
                    required
                  />
                  {errores.telefono && <div className="invalid-feedback">{errores.telefono}</div>}
                </div>
              </div>

              {/* Correo Electrónico */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary">
                  <i className="bi bi-envelope-fill me-1 text-success"></i> Correo Electrónico
                </label>
                <input
                  type="email"
                  className={`form-control ${errores.email ? "is-invalid" : ""}`}
                  placeholder="ejemplo@mascota.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errores.email) setErrores({ ...errores, email: "" });
                  }}
                  required
                />
                {errores.email && <div className="invalid-feedback">{errores.email}</div>}
              </div>

              {/* Fila Contraseña y Confirmación */}
              <div className="row">
                <div className="col-md-6 mb-4">
                  <label className="form-label fw-semibold text-secondary">
                    <i className="bi bi-lock-fill me-1 text-success"></i> Contraseña
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errores.password ? "is-invalid" : ""}`}
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errores.password) setErrores({ ...errores, password: "" });
                    }}
                    required
                  />
                  {errores.password && <div className="invalid-feedback">{errores.password}</div>}
                </div>

                <div className="col-md-6 mb-4">
                  <label className="form-label fw-semibold text-secondary">
                    <i className="bi bi-shield-lock-fill me-1 text-success"></i> Confirmar
                  </label>
                  <input
                    type="password"
                    className={`form-control ${errores.confirmPassword ? "is-invalid" : ""}`}
                    placeholder="Repetir contraseña"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errores.confirmPassword) setErrores({ ...errores, confirmPassword: "" });
                    }}
                    required
                  />
                  {errores.confirmPassword && <div className="invalid-feedback">{errores.confirmPassword}</div>}
                </div>
              </div>

              {/* Botón de registro */}
              <button type="submit" className="btn btn-success w-100 mb-3 fw-bold shadow-sm py-2">
                <i className="bi bi-check-circle-fill me-2"></i> Crear Cuenta Veterinaria
              </button>
            </form>

            <div className="text-center mt-2">
              <span className="text-muted small">¿Ya tenés una cuenta? </span>
              <button 
                className="btn btn-link p-0 pb-1 small text-info fw-bold text-decoration-none" 
                onClick={() => navigate("/login")}
              >
                Iniciá sesión acá
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Registro;