import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CargarMascota = () => {
  const navigate = useNavigate();

  // Estados del formulario
  const [nombre, setNombre] = useState("");
  const [especie, setEspecie] = useState("");
  const [raza, setRaza] = useState("");
  const [edad, setEdad] = useState("");
  const [peso, setPeso] = useState("");
  const [antecedentes, setAntecedentes] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);

  const [errores, setErrores] = useState({});

  // Manejar la carga de la foto con validaciones de tipo y tamaño
  const handleFotoChange = (e) => {
    const archivo = e.target.files[0];
    const nuevosErrores = { ...errores };

    if (archivo) {
      // Validar Tipo de Archivo (Solo imágenes)
      if (!archivo.type.startsWith("image/")) {
        nuevosErrores.foto = "El archivo debe ser una imagen (JPG, PNG o WEBP).";
        setFoto(null);
        setFotoPreview(null);
        setErrores(nuevosErrores);
        return;
      }

      // Validar Tamaño Máximo (Ej: 3 MB = 3 * 1024 * 1024 bytes)
      const limiteTamano = 3 * 1024 * 1024;
      if (archivo.size > limiteTamano) {
        nuevosErrores.foto = "La imagen es muy pesada. El tamaño máximo permitido es de 3 MB.";
        setFoto(null);
        setFotoPreview(null);
        setErrores(nuevosErrores);
        return;
      }

      // Si pasa los filtros, guardamos y creamos la vista previa
      delete nuevosErrores.foto; // Limpia error si había uno previo
      setErrores(nuevosErrores);
      setFoto(archivo);
      setFotoPreview(URL.createObjectURL(archivo));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    // 1. Validar Nombre (Solo letras y espacios, mínimo 2 caracteres)
    const regexLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    if (!nombre.trim()) {
      nuevosErrores.nombre = "El nombre de la mascota es obligatorio.";
    } else if (!regexLetras.test(nombre.trim())) {
      nuevosErrores.nombre = "El nombre no puede contener números ni caracteres especiales.";
    } else if (nombre.trim().length < 2) {
      nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres.";
    }

    // 2. Validar Especie
    if (!especie) {
      nuevosErrores.especie = "Seleccioná la especie del animal.";
    }

    // 3. Validar Raza (Solo letras, ej: 'Golden Retriever' o 'Mestizo')
    if (!raza.trim()) {
      nuevosErrores.raza = "La raza o cruza es obligatoria.";
    } else if (!regexLetras.test(raza.trim())) {
      nuevosErrores.raza = "La raza no debe contener números.";
    }

    // 4. Validar Edad (Entre 0 y 30 años)
    if (edad === "") {
      nuevosErrores.edad = "La edad es obligatoria.";
    } else {
      const numEdad = Number(edad);
      if (numEdad < 0 || numEdad > 30) {
        nuevosErrores.edad = "Ingresá una edad lógica entre 0 y 30 años.";
      }
    }

    // 5. Validar Peso (Entre 0.1 kg y 120 kg)
    if (!peso) {
      nuevosErrores.peso = "El peso es obligatorio.";
    } else {
      const numPeso = Number(peso);
      if (numPeso <= 0 || numPeso > 120) {
        nuevosErrores.peso = "Ingresá un peso válido entre 0.1 y 120 kg.";
      }
    }

    // 6. Validar Antecedentes (Tope máximo de caracteres)
    if (antecedentes.length > 500) {
      nuevosErrores.antecedentes = "El historial médico no puede superar los 500 caracteres.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    console.log("Subiendo mascota validada con éxito...", { nombre, especie, raza, edad, peso, antecedentes, foto });

    alert(`¡La ficha clínica de ${nombre} fue registrada correctamente!`);
    navigate("/mis-turnos");
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow-sm border-0 border-top border-4 border-success p-4 bg-light bg-opacity-75">
            
            <div className="text-center mb-4">
              <h3 className="fw-bold text-success">🐾 Registrar Nueva Mascota</h3>
              <p className="text-muted">Creá la historia clínica digital de tu compañero</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              
              <div className="row">
                {/* Columna Izquierda: Datos */}
                <div className="col-md-7">
                  
                  {/* Nombre */}
                  <div className="mb-3">
                    <label className="form-label fw-bold text-secondary">Nombre de la Mascota</label>
                    <input
                      type="text"
                      className={`form-control ${errores.nombre ? "is-invalid" : "border-success border-opacity-25"}`}
                      placeholder="Ej: Odin, Lola"
                      value={nombre}
                      onChange={(e) => {
                        setNombre(e.target.value);
                        if (errores.nombre) setErrores({ ...errores, nombre: "" });
                      }}
                      required
                    />
                    {errores.nombre && <div className="invalid-feedback">{errores.nombre}</div>}
                  </div>

                  {/* Especie y Raza */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold text-secondary">Especie</label>
                      <select
                        className={`form-select ${errores.especie ? "is-invalid" : "border-success border-opacity-25"}`}
                        value={especie}
                        onChange={(e) => {
                          setEspecie(e.target.value);
                          if (errores.especie) setErrores({ ...errores, especie: "" });
                        }}
                        required
                      >
                        <option value="">-- Elegir --</option>
                        <option value="PERRO">Perro</option>
                        <option value="GATO">Gato</option>
                        <option value="AVE">Ave</option>
                        <option value="OTRO">Otro</option>
                      </select>
                      {errores.especie && <div className="invalid-feedback">{errores.especie}</div>}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold text-secondary">Raza / Cruza</label>
                      <input
                        type="text"
                        className={`form-control ${errores.raza ? "is-invalid" : "border-success border-opacity-25"}`}
                        placeholder="Ej: Golden, Mestizo"
                        value={raza}
                        onChange={(e) => {
                          setRaza(e.target.value);
                          if (errores.raza) setErrores({ ...errores, raza: "" });
                        }}
                        required
                      />
                      {errores.raza && <div className="invalid-feedback">{errores.raza}</div>}
                    </div>
                  </div>

                  {/* Edad y Peso */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold text-secondary">Edad (Años)</label>
                      <input
                        type="number"
                        className={`form-control ${errores.edad ? "is-invalid" : "border-success border-opacity-25"}`}
                        placeholder="Ej: 3"
                        value={edad}
                        onChange={(e) => {
                          setEdad(e.target.value);
                          if (errores.edad) setErrores({ ...errores, edad: "" });
                        }}
                        required
                      />
                      {errores.edad && <div className="invalid-feedback">{errores.edad}</div>}
                    </div>
                    
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold text-secondary">Peso (Kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className={`form-control ${errores.peso ? "is-invalid" : "border-success border-opacity-25"}`}
                        placeholder="Ej: 14.5"
                        value={peso}
                        onChange={(e) => {
                          setPeso(e.target.value);
                          if (errores.peso) setErrores({ ...errores, peso: "" });
                        }}
                        required
                      />
                      {errores.peso && <div className="invalid-feedback">{errores.peso}</div>}
                    </div>
                  </div>

                </div>

                {/* Columna Derecha: Foto */}
                <div className="col-md-5 d-flex flex-column align-items-center justify-content-center border-start border-2 border-light">
                  <label className="form-label fw-bold text-secondary mb-3">Foto de Perfil</label>
                  
                  <div 
                    className={`border border-2 rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm mb-2 ${errores.foto ? "border-danger" : "border-dashed"}`}
                    style={{ width: "160px", height: "160px", overflow: "hidden", borderStyle: errores.foto ? "solid" : "dashed" }}
                  >
                    {fotoPreview ? (
                      <img src={fotoPreview} alt="Mascota" className="w-100 h-100" style={{ objectFit: "cover" }} />
                    ) : (
                      <i className={`bi bi-camera ${errores.foto ? "text-danger" : "text-muted"}`} style={{ fontSize: "2.5rem" }}></i>
                    )}
                  </div>

                  {errores.foto && <div className="text-danger small text-center mb-2 px-2" style={{ fontSize: "0.82rem" }}>{errores.foto}</div>}

                  <input
                    type="file"
                    id="fotoMascota"
                    className="d-none"
                    accept="image/*"
                    onChange={handleFotoChange}
                  />
                  <label htmlFor="fotoMascota" className="btn btn-outline-success btn-sm fw-bold px-3">
                    <i className="bi bi-upload me-1"></i> Seleccionar Foto
                  </label>
                </div>
              </div>

              {/* Historial Médico */}
              <div className="mb-4 mt-3">
                <label className="form-label fw-bold text-secondary">
                  <i className="bi bi-file-earmark-medical-fill text-success me-1"></i> Antecedentes Médicos / Intervenciones
                </label>
                <textarea
                  className={`form-control ${errores.antecedentes ? "is-invalid" : "border-success border-opacity-25"}`}
                  rows="3"
                  placeholder="Detallá si tuvo cirugías, alergias, castración o enfermedades crónicas relevantes..."
                  value={antecedentes}
                  onChange={(e) => {
                    setAntecedentes(e.target.value);
                    if (errores.antecedentes) setErrores({ ...errores, antecedentes: "" });
                  }}
                ></textarea>
                {errores.antecedentes && <div className="invalid-feedback">{errores.antecedentes}</div>}
                <div className="text-muted text-end small mt-1">{antecedentes.length}/500 carac.</div>
              </div>

              {/* Botonera */}
              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary fw-bold"
                  onClick={() => navigate("/mis-turnos")}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success px-4 fw-bold shadow-sm">
                  <i className="bi bi-save-fill me-2"></i> Guardar Mascota
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CargarMascota;