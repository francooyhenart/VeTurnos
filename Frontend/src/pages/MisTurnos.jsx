import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const MisTurnos = () => {
  const navigate = useNavigate();

  // Turnos clínicos de prueba (Simulan los datos que vendrán de la Base de Datos)
  const [turnos, setTurnos] = useState([
    {
      id: 1,
      mascota: "Firulais",
      especie: "PERRO",
      servicio: "Vacunación y Desparasitación",
      veterinario: "Dra. Martínez",
      fecha: "2026-05-26",
      hora: "09:30",
      estado: "CONFIRMADO"
    },
    {
      id: 2,
      mascota: "Michi",
      especie: "GATO",
      servicio: "Consulta General Clínica",
      veterinario: "Dr. Pérez",
      fecha: "2026-05-28",
      hora: "16:00",
      estado: "CONFIRMADO"
    }
  ]);

  // Función para simular la cancelación de una cita con confirmación
  const cancelarTurno = (id, nombreMascota) => {
    const confirmar = window.confirm(`¿Estás seguro de que querés cancelar el turno de ${nombreMascota}?`);
    if (confirmar) {
      setTurnos(turnos.filter(turno => turno.id !== id));
    }
  };

  return (
    <div className="container mt-5">
      {/* Cabecera del Panel */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 pb-3 border-bottom border-2 border-light">
        <div>
          <h2 className="fw-bold text-success mb-1">🐾 Panel de Gestión de Citas</h2>
          <p className="text-muted m-0">Revisá el estado médico y turnos programados de tus pacientes</p>
        </div>
        
        {/* BOTONERA PRINCIPAL INTERCONECTADA */}
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <button 
            className="btn btn-info text-white fw-bold shadow-sm px-3 d-flex align-items-center"
            onClick={() => navigate("/cargar-mascota")}
          >
            <i className="bi bi-plus-circle-fill me-2"></i> Registrar Mascota
          </button>
          
          <button 
            className="btn btn-success fw-bold shadow-sm px-3 d-flex align-items-center"
            onClick={() => navigate("/nuevo-turno")}
          >
            <i className="bi bi-calendar-plus-fill me-2"></i> Solicitar Turno
          </button>
        </div>
      </div>

      {/* Renderizado Condicional: Si no hay turnos */}
      {turnos.length === 0 ? (
        <div className="alert alert-info text-center shadow-sm py-4 rounded-3 border-0 bg-info bg-opacity-10">
          <i className="bi bi-info-circle-fill text-info display-6 mb-2 d-block"></i>
          <h5 className="fw-bold text-info">¡Sin turnos reservados!</h5>
          <p className="text-secondary small mb-0">Hacé clic en "Solicitar Turno" para agendar una cita médica veterinaria.</p>
        </div>
      ) : (
        /* Listado de Tarjetas Estilo Ficha Clínica */
        <div className="row">
          {turnos.map((turno) => (
            <div className="col-md-6 mb-4" key={turno.id}>
              <div className="card shadow-sm border-0 border-start border-4 border-success h-100 bg-white">
                <div className="card-body p-4">
                  
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="fw-bold text-dark mb-1">
                        {turno.especie === "PERRO" ? "🐶" : "🐱"} {turno.mascota}
                      </h5>
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold rounded-pill small px-2 py-1">
                        {turno.servicio}
                      </span>
                    </div>
                    <span className="badge bg-success px-3 py-1 fw-bold tracking-wider">
                      {turno.estado}
                    </span>
                  </div>

                  <div className="row text-secondary small mb-3 g-2">
                    <div className="col-6">
                      <i className="bi bi-person-fill text-success me-1"></i> 
                      <strong>Médico:</strong> {turno.veterinario}
                    </div>
                    <div className="col-6">
                      <i className="bi bi-calendar3 text-success me-1"></i> 
                      <strong>Fecha:</strong> {turno.fecha}
                    </div>
                    <div className="col-12 mt-2">
                      <i className="bi bi-clock-fill text-success me-1"></i> 
                      <strong>Horario:</strong> {turno.hora} hs
                    </div>
                  </div>

                  <div className="d-flex justify-content-end border-top border-light pt-3 mt-2">
                    <button 
                      className="btn btn-outline-danger btn-sm fw-bold d-flex align-items-center px-3"
                      onClick={() => cancelarTurno(turno.id, turno.mascota)}
                    >
                      <i className="bi bi-trash3-fill me-1"></i> Cancelar Cita
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};