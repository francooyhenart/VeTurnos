import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NuevoTurno = () => {
  const navigate = useNavigate();

  // Estados para capturar los datos del formulario
  const [servicio, setServicio] = useState("");
  const [profesional, setProfesional] = useState("");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  
  const [error, setError] = useState(""); // Errores de conexión o backend
  const [errores, setErrores] = useState({}); // Errores de validación local

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

  // Función de validación temporal y de campos
  const validarFormulario = () => {
    const nuevosErrores = {};

    // 1. Validar que seleccionen un servicio real
    if (!servicio) {
      nuevosErrores.servicio = "Por favor, seleccioná un servicio médico.";
    }

    // 2. Validar que seleccionen un profesional
    if (!profesional) {
      nuevosErrores.profesional = "Por favor, asigná un veterinario/a.";
    }

    // 3. Validar Fecha (Evitar días pasados y fines de semana)
    if (!fecha) {
      nuevosErrores.fecha = "La fecha del turno es obligatoria.";
    } else {
      const fechaSeleccionada = new Date(fecha + "T00:00:00"); // Evita desfasaje de zona horaria
      const diaSemana = fechaSeleccionada.getDay(); // 0 = Domingo, 6 = Sábado

      if (diaSemana === 0 || diaSemana === 6) {
        nuevosErrores.fecha = "La clínica atiende únicamente de lunes a viernes. Por favor, elegí un día hábil.";
      }
    }

    // 4. Validar Horario (Rango de atención: 08:00 a 20:00 hs)
    if (!hora) {
      nuevosErrores.hora = "La hora del turno es obligatoria.";
    } else {
      const [horas, minutos] = hora.split(":").map(Number);
      if (horas < 8 || horas >= 20) {
        nuevosErrores.hora = "El horario de atención es de 08:00 a 20:00 hs. Elegí un rango válido.";
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Si la validación local falla, no avanza al backend
    if (!validarFormulario()) return;

    try {
      // 🚀 LÓGICA DE PRODUCCIÓN: Conexión con el backend
      console.log("Guardando turno veterinario validado...", { servicio, profesional, fecha, hora });
      
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
          <div className="card shadow-sm border-0 p-4 border-top border-4 border-success bg-light bg-opacity-75">
            
            <div className="mb-4 text-center">
              <h3 className="fw-bold text-success">🩺 Solicitar Cita Médica</h3>
              <p className="text-muted">Completá la ficha para reservar el turno de tu mascota</p>
            </div>

            {error && <div className="alert alert-danger shadow-sm py-2 small">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              
              {/* 1. Selección de Servicio */}
              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">
                  <i className="bi bi-heart-pulse-fill text-success me-1"></i> Tipo de Servicio
                </label>
                <select 
                  className={`form-select ${errores.servicio ? "is-invalid" : "border-success border-opacity-25"}`}
                  value={servicio}
                  onChange={(e) => {
                    setServicio(e.target.value);
                    if (errores.servicio) setErrores({ ...errores, servicio: "" });
                  }}
                  required
                >
                  <option value="">-- Seleccioná una prestación --</option>
                  {serviciosDisponibles.map((serv, index) => (
                    <option key={index} value={serv}>{serv}</option>
                  ))}
                </select>
                {errores.servicio && <div className="invalid-feedback">{errores.servicio}</div>}
              </div>

              {/* 2. Selección de Profesional */}
              <div className="mb-3">
                <label className="form-label fw-bold text-secondary">
                  <i className="bi bi-person-badge-fill text-success me-1"></i> Veterinario/a a cargo
                </label>
                <select 
                  className={`form-select ${errores.profesional ? "is-invalid" : "border-success border-opacity-25"}`}
                  value={profesional}
                  onChange={(e) => {
                    setProfesional(e.target.value);
                    if (errores.profesional) setErrores({ ...errores, profesional: "" });
                  }}
                  required
                >
                  <option value="">-- Seleccioná un profesional --</option>
                  {profesionalesDisponibles.map((prof, index) => (
                    <option key={index} value={prof}>{prof}</option>
                  ))}
                </select>
                {errores.profesional && <div className="invalid-feedback">{errores.profesional}</div>}
              </div>

              {/* 3. Fecha y Hora */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold text-secondary">
                    <i className="bi bi-calendar-event text-success me-1"></i> Fecha de Visita
                  </label>
                  <input 
                    type="date" 
                    className={`form-control ${errores.fecha ? "is-invalid" : "border-success border-opacity-25"}`}
                    value={fecha}
                    min={new Date().toISOString().split("T")[0]} 
                    onChange={(e) => {
                      setFecha(e.target.value);
                      if (errores.fecha) setErrores({ ...errores, fecha: "" });
                    }}
                    required
                  />
                  {errores.fecha && <div className="invalid-feedback">{errores.fecha}</div>}
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold text-secondary">
                    <i className="bi bi-clock text-success me-1"></i> Horario de Cita
                  </label>
                  <input 
                    type="time" 
                    className={`form-control ${errores.hora ? "is-invalid" : "border-success border-opacity-25"}`}
                    value={hora}
                    onChange={(e) => {
                      setHora(e.target.value);
                      if (errores.hora) setErrores({ ...errores, hora: "" });
                    }}
                    required
                  />
                  {errores.hora && <div className="invalid-feedback">{errores.hora}</div>}
                </div>
              </div>

              {/* Botones de acción */}
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