import { useState, useEffect } from 'react'
import TareaItem from './TareaItem'

const API = "https://actuaciones-backend-production.up.railway.app"

function Actuacion({ actuacion, onEliminar, token }) {
  const [abierto, setAbierto] = useState(false)
  const [tareas, setTareas] = useState([])
  const [nuevaTarea, setNuevaTarea] = useState("")

  async function cargarTareas() {
    const res = await fetch(API + "/actuaciones/" + actuacion.id + "/tareas", {
      headers: { Authorization: "Bearer " + token }
    })
    const datos = await res.json()
    setTareas(datos)
  }

  useEffect(function() {
    if (abierto) cargarTareas()
  }, [abierto])

  async function agregarTarea() {
    if (!nuevaTarea.trim()) return
    await fetch(API + "/actuaciones/" + actuacion.id + "/tareas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ nombre: nuevaTarea })
    })
    setNuevaTarea("")
    cargarTareas()
  }

  async function toggleTarea(id, completada) {
    await fetch(API + "/tareas/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ completada: completada ? 0 : 1 })
    })
    cargarTareas()
  }

  async function eliminarTarea(id) {
    await fetch(API + "/tareas/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    })
    cargarTareas()
  }

  const completadas = tareas.filter(function(t) { return t.completada }).length

  return (
    <div className="actuacion-card">
      <div className="actuacion-header" onClick={() => setAbierto(!abierto)}>
        <div className="actuacion-info">
          <div className="actuacion-numero">Actuación {actuacion.numero}</div>
          <div className="actuacion-detalle">
            {actuacion.damnificado} · {actuacion.lugar} · Fecha del hecho: {actuacion.fecha_recepcion}
          </div>
          <div className="actuacion-caratula">{actuacion.caratula}</div>
        </div>
        <div className="actuacion-right">
          {tareas.length > 0 && (
            <span className="progreso">{completadas}/{tareas.length}</span>
          )}
          <span className="chevron">{abierto ? "▲" : "▼"}</span>
        </div>
      </div>

      {abierto && (
        <div className="actuacion-body">
          <div className="tareas-lista">
            {tareas.map(function(t) {
              return (
                <TareaItem
                  key={t.id}
                  tarea={t}
                  onToggle={toggleTarea}
                  onEliminar={eliminarTarea}
                />
              )
            })}
          </div>

          <div className="agregar-tarea">
            <input
              type="text"
              placeholder="Agregar tarea..."
              value={nuevaTarea}
              onChange={function(e) { setNuevaTarea(e.target.value) }}
              onKeyDown={function(e) { if (e.key === 'Enter') agregarTarea() }}
            />
            <button onClick={agregarTarea}>Agregar</button>
          </div>

          <button className="btn-eliminar-actuacion" onClick={() => onEliminar(actuacion.id)}>
            🗑️ Eliminar actuación
          </button>
        </div>
      )}
    </div>
  )
}

export default Actuacion