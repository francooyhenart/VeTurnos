import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

const Registro = () => {
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Conexión real con el backend
      await authService.registro(nombreCompleto, dni, telefono, email, password);
      alert("¡Cuenta creada con éxito!");
      
      // Redirección automática al panel principal
      navigate("/mis-turnos");
    } catch (err) {
      setError(err.message || "Error al intentar registrar el usuario.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          {/* Tarjeta con borde superior verde veterinario */}
          <div className="card shadow-sm border-0 border-top border-4 border-success p-4 bg-light bg-opacity-75">
            
            {/* Título e ícono temático */}
            <div className="text-center mb-4">
              <h3 className="fw-bold text-success mb-1">🐾 Unirse a VeTurnos</h3>
              <p className="text-muted small">Registrate para gestionar las consultas de tus mascotas</p>
            </div>

            {error && <div className="alert alert-danger shadow-sm py-2 small">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary">
                  <i className="bi bi-person-badge-fill me-1 text-success"></i> Nombre Completo
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Juan Pérez"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-secondary">
                    <i className="bi bi-card-text me-1 text-success"></i> DNI
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="12345678"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold text-secondary">
                    <i className="bi bi-telephone-fill me-1 text-success"></i> Teléfono
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="2215551234"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary">
                  <i className="bi bi-envelope-fill me-1 text-success"></i> Correo Electrónico
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="ejemplo@mascota.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-secondary">
                  <i className="bi bi-lock-fill me-1 text-success"></i> Contraseña
                </label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Creá una contraseña segura"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Botón de registro en Verde */}
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