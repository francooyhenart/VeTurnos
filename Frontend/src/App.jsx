import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import { MisTurnos } from "./pages/MisTurnos";
import NuevoTurno from "./pages/NuevoTurno";

function App() {
  return (
    <Router>
      {/* Contenedor general con fondo suave estilo clínica limpia */}
      <div className="App min-vh-100 bg-light bg-opacity-75 pb-5">
        <Routes>
          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* RUTAS PÚBLICAS */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* RUTAS PRIVADAS */}
          <Route path="/mis-turnos" element={<MisTurnos />} />
          <Route path="/nuevo-turno" element={<NuevoTurno />} />

          {/* Redirección por cualquier ruta inexistente */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;