import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NuevoTurno = () => {
  const navigate = useNavigate();

  // Estados para capturar los datos del formulario
  const [servicio, setServicio] = useState("");
  const [profesional, setProfesional] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [error, setError] = useState("");

  // Datos adaptados a la Veterinaria
  const serviciosDisponibles = [
    "Consulta General Clínica",
    "Vacunación y Desparasitación",
    "Cirugía / Castración",
    "Análisis Clínicos / Laboratorio",
    "Ecografía / Rayos X"
  ];

  const profesionalesDisponibles = [
    "Dra. Martínez (Clínica General)",
    "Dr. Pérez (Cirujano)",
    "Dra. Gómez (Especialista)"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!servicio || !profesional || !fecha || !hora) {
      setError("Por favor, completá todos los campos para agendar la cita.");
      return;
    }

    try {
      // 🚀 LÓGICA DE PRODUCCIÓN: Acá irá el fetch a tu backend
      console.log("Guardando turno veterinario...", { servicio, profesional, fecha, hora });
      
      alert("¡Turno para tu mascota solicitado con éxito!");
      navigate("/mis-turnos");
    } catch (err) {
      setError("Error al conectar con el servidor clínico. Intentelo más tarde.");
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          {/* Tarjeta con estética de ficha médica (verde clínico) */}
          <div className="card shadow-sm border-0 p-4 border-top border-4 border-success bg-light bg-opacity-75">
            
            {/* Título y Subtítulo temático */}
            <div className="mb-4 text-center">
              <h3 className="fw-bold text-success">🩺 Solicitar Cita Médica</h3>
              <p className="text-muted">Completá la ficha para reservar el turno de tu mascota</p>
            </div>

            {error && <div className="alert alert-danger shadow-sm py-2 small">{error}</div>}

            <form onSubmit={handleSubmit}>
              
              {/* 1. Selección de Servicio */}
              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">
                  <i className="bi bi-heart-pulse-fill text-success me-1"></i> Tipo de Servicio
                </label>
                <select 
                  className="form-select border-success border-opacity-25"
                  value={servicio}
                  onChange={(e) => setServicio(e.target.value)}
                  required
                >
                  <option value="">-- Seleccioná una prestación --</option>
                  {serviciosDisponibles.map((serv, index) => (
                    <option key={index} value={serv}>{serv}</option>
                  ))}
                </select>
              </div>

              {/* 2. Selección de Profesional */}
              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">
                  <i className="bi bi-person-badge-fill text-success me-1"></i> Veterinario/a a cargo
                </label>
                <select 
                  className="form-select border-success border-opacity-25"
                  value={profesional}
                  onChange={(e) => setProfesional(e.target.value)}
                  required
                >
                  <option value="">-- Seleccioná un profesional --</option>
                  {profesionalesDisponibles.map((prof, index) => (
                    <option key={index} value={prof}>{prof}</option>
                  ))}
                </select>
              </div>

              {/* 3. Fecha y Hora */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold text-secondary">
                    <i className="bi bi-calendar-event text-success me-1"></i> Fecha de Visita
                  </label>
                  <input 
                    type="date" 
                    className="form-control border-success border-opacity-25"
                    value={fecha}
                    min={new Date().toISOString().split("T")[0]} 
                    onChange={(e) => setFecha(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold text-secondary">
                    <i className="bi bi-clock text-success me-1"></i> Horario de Cita
                  </label>
                  <input 
                    type="time" 
                    className="form-control border-success border-opacity-25"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Botones de acción unificados */}
              <div className="d-flex justify-content-end gap-2 mt-4">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary fw-bold"
                  onClick={() => navigate("/mis-turnos")}
                >
                  Volver al Panel
                </button>
                <button type="submit" className="btn btn-success px-4 fw-bold shadow-sm">
                  <i className="bi bi-check-circle-fill me-2"></i> Agendar Turno
                </button>
              </div>

            </form>

            <div className="mt-4 p-3 bg-info bg-opacity-10 rounded text-center">
                <small className="text-info fw-bold">🐾 Recordatorio: Por favor, traé a tu mascota con correa o en su transportadora.</small>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default NuevoTurno;