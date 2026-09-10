import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import FormActuacion from '../components/FormActuacion'
import Actuacion from '../components/Actuacion'

const API = "https://actuaciones-backend-production.up.railway.app"

function Dashboard({ onToggleTema, tema }) {
  const [actuaciones, setActuaciones] = useState([])
  const [historial, setHistorial] = useState([])
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const token = localStorage.getItem('token')
  const [busqueda, setBusqueda] = useState("")
  const [historialAbierto, setHistorialAbierto] = useState(false)
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")

  async function cargarActuaciones() {
    const res = await fetch(API + "/actuaciones", {
      headers: { Authorization: "Bearer " + token }
    })
    const datos = await res.json()
    setActuaciones(datos)
  }

  async function cargarHistorial() {
    const res = await fetch(API + "/actuaciones/historial", {
      headers: { Authorization: "Bearer " + token }
    })

    if (!res.ok) {
      setError("No se pudo cargar el historial de actuaciones")
      return
    }

    const datos = await res.json()
    setHistorial(datos)
  }

  useEffect(function() {
    cargarActuaciones()
    cargarHistorial()
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

  async function elevarActuacion(id) {
    setError("")
    setMensaje("")

    const res = await fetch(API + "/actuaciones/" + id + "/elevar", {
      method: "PUT",
      headers: { Authorization: "Bearer " + token }
    })
    const datos = await res.json().catch(function() { return {} })

    if (!res.ok) {
      setError(datos.error || "No se pudo elevar la actuación")
      return false
    }

    setMensaje("Actuación elevada y guardada en el historial")
    cargarActuaciones()
    cargarHistorial()
    return true
  }

  async function eliminarActuacion(id) {
    const res = await fetch(API + "/actuaciones/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    })

    if (!res.ok) {
      setError("No se pudo eliminar la actuación")
      return false
    }

    cargarActuaciones()
    return true
  }

  async function alternarHistorial() {
    setHistorialAbierto(!historialAbierto)
  }

  function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  const actuacionesFiltradas = actuaciones.filter(function(a) {
  const texto = busqueda.toLowerCase()
  return (
    a.numero.toLowerCase().includes(texto) ||
    a.damnificado.toLowerCase().includes(texto) ||
    a.lugar.toLowerCase().includes(texto) ||
    a.caratula.toLowerCase().includes(texto)
  )
})

return (
  <div className="dashboard">
    <header className="dashboard-header">
      <h1>Sistema de Actuaciones</h1>
      <div className="header-right">
      <span>Hola, {usuario.nombre}</span>
      <button onClick={() => navigate('/registros')} className="btn-nuevo">Registros</button>
      <button onClick={onToggleTema} className="btn-tema">
      {tema === 'dark' ? '☀️' : '🌙'}
      </button>
      <button onClick={cerrarSesion} className="btn-logout">Cerrar sesión</button>
    </div>
    </header>

    <div className="dashboard-content">
      <FormActuacion onAgregar={agregarActuacion} />
      {error && <p className="error">{error}</p>}
      {mensaje && <p className="success">{mensaje}</p>}

      <div className="seccion">
        <div className="seccion-header">
  <h2>Mis actuaciones ({actuacionesFiltradas.length})</h2>
  <input
    type="text"
    placeholder="Buscar..."
    value={busqueda}
    onChange={function(e) { setBusqueda(e.target.value) }}
    className="input-busqueda-inline"
  />
</div>

        {actuacionesFiltradas.length === 0 && <p className="vacio">No hay actuaciones registradas</p>}

        {actuacionesFiltradas.map(function(a) {
          return (
            <Actuacion
              key={a.id}
              actuacion={a}
              onEliminar={eliminarActuacion}
              onElevar={elevarActuacion}
              token={token}
            />
          )
        })}
      </div>

      <section className="seccion historial">
        <div className="seccion-header">
          <h2>Historial de actuaciones ({historial.length})</h2>
          <button type="button" className="btn-historial" onClick={alternarHistorial}>
            {historialAbierto ? "Ocultar historial" : "Ver historial"}
          </button>
        </div>

        {historialAbierto && (
          <div className="historial-lista">
            {historial.length === 0 && <p className="vacio">No hay actuaciones elevadas</p>}

            {historial.map(function(a) {
              return (
                <article key={a.id} className="historial-card">
                  <div className="historial-info">
                    <div className="historial-numero">Actuación {a.numero}</div>
                    <div className="historial-caratula">{a.caratula}</div>
                    <div className="historial-detalle">
                      {a.damnificado} · {a.lugar} · Fecha del hecho: {a.fecha_recepcion}
                    </div>
                  </div>
                  <span className="estado-elevada">Elevada</span>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  </div>
)
}
export default Dashboard
