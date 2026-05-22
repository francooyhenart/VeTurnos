import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Conexión real con el backend
      await authService.login(email, password);
      
      // Si la respuesta es exitosa, redirige al panel de turnos
      navigate("/mis-turnos");
    } catch (err) {
      setError(err.message || "Ocurrió un error al intentar iniciar sesión.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          {/* Tarjeta con borde superior verde veterinario */}
          <div className="card shadow-sm border-0 border-top border-4 border-success p-4 bg-light bg-opacity-70">
            
            {/* Título e ícono temático */}
            <div className="text-center mb-4">
              <h3 className="fw-bold text-success mb-1">🐾 VeTurnos</h3>
              <p className="text-muted small">Ingresá al sistema de gestión veterinaria</p>
            </div>
            
            {error && <div className="alert alert-danger shadow-sm py-2 small">{error}</div>}

            <form onSubmit={handleSubmit}>
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {/* Botón de ingreso en Verde */}
              <button type="submit" className="btn btn-success w-100 mb-3 fw-bold shadow-sm py-2">
                <i className="bi bi-box-arrow-in-right me-2"></i> Ingresar a la Clínica
              </button>
            </form>

            <div className="text-center mt-2">
              <span className="text-muted small">¿No tenés cuenta? </span>
              <button 
                className="btn btn-link p-0 pb-1 small text-info fw-bold text-decoration-none" 
                onClick={() => navigate("/registro")}
              >
                Registrate acá
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;