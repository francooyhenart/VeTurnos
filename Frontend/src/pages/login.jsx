import { useState } from "react";
import { authService } from "../services/auth.service";

function Login() {
  // Estados para capturar lo que escribe el usuario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Estados para manejar el feedback visual (errores o carga)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Llamamos al servicio que creamos en el paso anterior
      const user = await authService.login(email, password);
      
      // Por ahora, tiramos un alert para verificar que ande bien.
      // Luego cambiaremos esto para redirigir según el rol (CLIENTE o ADMINISTRADOR)
      alert(`¡Bienvenido/a ${user.nombreCompleto}! Rol: ${user.rol}`);
      
    } catch (err) {
      // Si el backend tiró un error (ej: "Credenciales incorrectas"), lo mostramos
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm mt-5">
            <div className="card-body p-4">
              <h2 className="text-center mb-4 text-primary fw-bold">VeTurnos</h2>
              <h5 className="text-center text-muted mb-4">Iniciar Sesión</h5>

              {/* Alerta de Bootstrap por si hay un error en las credenciales */}
              {error && (
                <div className="alert alert-danger py-2 text-center" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Campo Email */}
                <div className="mb-3">
                  <label className="form-label text-secondary fw-semibold">Correo Electrónico</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><i className="bi bi-envelope"></i></span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="ejemplo@correo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Campo Contraseña */}
                <div className="mb-4">
                  <label className="form-label text-secondary fw-semibold">Contraseña</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted"><i className="bi bi-lock"></i></span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="******"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Botón de Ingreso */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 fw-bold py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Ingresando...
                    </>
                  ) : (
                    "Ingresar"
                  )}
                </button>
              </form>

              <div className="text-center mt-3">
                <small className="text-muted">
                  ¿No tenés una cuenta? <a href="#" className="text-decoration-none">Registrate acá</a>
                </small>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;