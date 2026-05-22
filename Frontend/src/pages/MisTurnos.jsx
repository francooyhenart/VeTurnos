import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const MisTurnos = () => {
  const navigate = useNavigate();
  
  // Datos de prueba temporales con temática veterinaria para ver el diseño
  const [turnos, setTurnos] = useState([
    { id: 1, mascota: "Firulais", servicio: "Control y Vacunación", profesional: "Dra. Martínez (Veterinaria)", fecha: "26/05/2026", hora: "10:30", estado: "Confirmado" },
    { id: 2, mascota: "Michi", servicio: "Castración / Cirugía", profesional: "Dr. Pérez (Cirujano)", fecha: "28/05/2026", hora: "08:00", estado: "Pendiente" }
  ]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getBadgeClass = (estado) => {
    switch (estado) {
      case 'Confirmado': return 'bg-success';
      case 'Pendiente': return 'bg-warning text-dark';
      case 'Cancelado': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container mt-5">
      {/* Botón de Cerrar Sesión arriba de todo */}
      <div className="d-flex justify-content-end mb-2">
        <button className="btn btn-outline-secondary btn-sm animate-pulse" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right me-1"></i> Cerrar Sesión
        </button>
      </div>

      {/* Encabezado adaptado a Veterinaria */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap p-4 bg-info bg-opacity-10 rounded shadow-sm border-start border-info border-4">
        <div>
          <h2 className="fw-bold text-success">🐾 Mis VeTurnos</h2>
          <p className="text-muted m-0">Gestioná las consultas médicas y turnos de tus mascotas</p>
        </div>
        
        {/* Botón de acción principal en Verde Veterinario */}
        <button 
          className="btn btn-success btn-lg shadow-sm fw-bold mt-2 mt-md-0"
          onClick={() => navigate("/nuevo-turno")}
        >
          <i className="bi bi-plus-circle-fill me-2"></i> Solicitar Turno Clínico
        </button>
      </div>

      <hr className="text-muted" />

      {/* Grid de Turnos / Cartel Informativo */}
      {turnos.length === 0 ? (
        <div className="alert alert-info text-center mt-4 p-5 shadow-sm" role="alert">
          <h4 className="alert-heading fw-bold">🐾 ¡Sin turnos reservados!</h4>
          <p className="mb-0">Todavía no tenés ningún turno agendado para tus mascotas.</p>
          <p className="small text-secondary mt-2">¡Hacé clic en el botón de arriba para reservar la primera consulta!</p>
        </div>
      ) : (
        <div className="row mt-4">
          {turnos.map((turno) => (
            <div className="col-md-6 col-lg-4 mb-4" key={turno.id}>
              {/* Tarjeta con borde superior verde clínico (success) */}
              <div className="card h-100 shadow-sm border-0 border-top border-4 border-success bg-light bg-opacity-50">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className={`badge ${getBadgeClass(turno.estado)} px-3 py-2 fw-bold`}>
                      {turno.estado}
                    </span>
                    <small className="text-muted fw-bold">Ficha #{turno.id}</small>
                  </div>
                  
                  {/* Nombre de la mascota destacado */}
                  <h4 className="fw-bold text-dark mb-1">
                    🐶 {turno.mascota || "Paciente"}
                  </h4>
                  <h6 className="text-success fw-bold card-subtitle mb-3">{turno.servicio}</h6>
                  
                  <div className="card-text text-secondary mb-2 small">
                    <i className="bi bi-heart-pulse-fill text-success me-2"></i>
                    <strong>Profesional:</strong> {turno.profesional}
                  </div>

                  <div className="card-text text-secondary mb-2 small">
                    <i className="bi bi-calendar-check text-success me-2"></i>
                    <strong>Fecha:</strong> {turno.fecha}
                  </div>

                  <div className="card-text text-secondary mb-3 small">
                    <i className="bi bi-clock-history text-success me-2"></i>
                    <strong>Hora:</strong> {turno.hora} hs
                  </div>
                </div>

                <div className="card-footer bg-transparent border-0 d-flex justify-content-end pb-3">
                  {turno.estado !== 'Cancelado' && (
                    <button className="btn btn-outline-danger btn-sm fw-bold">
                      <i className="bi bi-calendar-x me-1"></i> Cancelar Turno
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};