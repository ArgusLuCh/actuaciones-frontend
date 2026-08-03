import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormActuacion from '../components/FormActuacion'
import Actuacion from '../components/Actuacion'

const API = "http://localhost:3000"

function Dashboard() {
  const [actuaciones, setActuaciones] = useState([])
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const token = localStorage.getItem('token')

  async function cargarActuaciones() {
    const res = await fetch(API + "/actuaciones", {
      headers: { Authorization: "Bearer " + token }
    })
    const datos = await res.json()
    setActuaciones(datos)
  }

  useEffect(function() {
    cargarActuaciones()
  }, [])

  async function agregarActuacion(form) {
    await fetch(API + "/actuaciones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(form)
    })
    cargarActuaciones()
  }

  async function eliminarActuacion(id) {
    await fetch(API + "/actuaciones/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    })
    cargarActuaciones()
  }

  function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Sistema de Actuaciones</h1>
        <div className="header-right">
          <span>Hola, {usuario.nombre}</span>
          <button onClick={cerrarSesion} className="btn-logout">Cerrar sesión</button>
        </div>
      </header>

      <div className="dashboard-content">
        <FormActuacion onAgregar={agregarActuacion} />

        <div className="seccion">
          <h2>Mis actuaciones ({actuaciones.length})</h2>
          {actuaciones.length === 0 && <p className="vacio">No hay actuaciones registradas</p>}
          {actuaciones.map(function(a) {
            return (
              <Actuacion
                key={a.id}
                actuacion={a}
                onEliminar={eliminarActuacion}
                token={token}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Dashboard