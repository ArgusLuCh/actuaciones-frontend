import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = "https://actuaciones-backend-production.up.railway.app"

function Admin({ onToggleTema, tema }) {
  const [usuarios, setUsuarios] = useState([])
  const [actuaciones, setActuaciones] = useState([])
  const [form, setForm] = useState({ nombre: "", dni: "" })
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [busquedaGlobal, setBusquedaGlobal] = useState("")
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  async function cargarUsuarios() {
    const res = await fetch(API + "/admin/usuarios", {
      headers: { Authorization: "Bearer " + token }
    })
    const datos = await res.json()
    setUsuarios(datos)
  }

  async function cargarActuaciones() {
    const res = await fetch(API + "/admin/actuaciones", {
      headers: { Authorization: "Bearer " + token }
    })
    const datos = await res.json()
    setActuaciones(datos)
  }

  useEffect(function() {
    cargarUsuarios()
    cargarActuaciones()
  }, [])

  async function crearUsuario() {
    if (!form.nombre || !form.dni) {
      setError("Completá nombre y DNI")
      return
    }
    const res = await fetch(API + "/admin/usuarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify(form)
    })
    const datos = await res.json()

    if (!res.ok) {
      setError(datos.error)
      return
    }

    setMensaje("Usuario creado — Contraseña temporal: " + datos.password_temporal)
    setError("")
    setForm({ nombre: "", dni: "" })
    cargarUsuarios()
  }

  async function eliminarUsuario(id) {
    await fetch(API + "/admin/usuarios/" + id, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token }
    })
    cargarUsuarios()
    cargarActuaciones()
  }

  async function resetearPassword(id) {
  const res = await fetch(API + "/admin/usuarios/" + id + "/reset-password", {
    method: "PUT",
    headers: { Authorization: "Bearer " + token }
  })
  const datos = await res.json()
  setMensaje(datos.mensaje + " — el usuario deberá cambiarla al ingresar")
  cargarUsuarios()
}

  function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  const textoBusqueda = busquedaGlobal.trim().toLowerCase()
  const actuacionesFiltradas = actuaciones.filter(function(a) {
    if (!textoBusqueda) return true

    return [
      a.numero,
      a.caratula,
      a.damnificado,
      a.lugar,
      a.fecha_recepcion,
      a.responsable_nombre,
      a.responsable_dni
    ].some(function(valor) {
      return String(valor || "").toLowerCase().includes(textoBusqueda)
    })
  })

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Panel de Administración</h1>
        <div className="header-right">
  <button onClick={onToggleTema} className="btn-tema">
    {tema === 'dark' ? '☀️' : '🌙'}
  </button>
  <button onClick={cerrarSesion} className="btn-logout">Cerrar sesión</button>
</div>
      </header>

      <div className="dashboard-content">
        <div className="form-adicional">
          <h2>Crear usuario</h2>
          {error && <p className="error">{error}</p>}
          {mensaje && <p className="success">{mensaje}</p>}
          <div className="form-grid">
            <input
              type="text"
              placeholder="Nombre completo"
              value={form.nombre}
              onChange={function(e) { setForm({...form, nombre: e.target.value}) }}
            />
            <input
              type="text"
              placeholder="DNI"
              value={form.dni}
              onChange={function(e) { setForm({...form, dni: e.target.value}) }}
              onKeyDown={function(e) { if (e.key === 'Enter') crearUsuario() }}
            />
            <button onClick={crearUsuario}>Crear usuario</button>
          </div>
        </div>

        <div className="seccion">
          <h2>Usuarios registrados ({usuarios.length})</h2>
          {usuarios.map(function(u) {
            return (
              <div key={u.id} className="adicional-card">
                <div className="adicional-info">
                  <div className="adicional-empresa">{u.nombre}</div>
                  <div className="adicional-detalle">
                    DNI: {u.dni} · {u.rol}
                    {u.debe_cambiar_password ? " · ⚠️ No cambió contraseña" : " · ✅ Contraseña configurada"}
                  </div>
                </div>
{u.rol !== 'admin' && (
  <div className="user-acciones">
    <button className="btn-reset" onClick={() => resetearPassword(u.id)}>🔑 Resetear</button>
    <button className="btn-eliminar" onClick={() => eliminarUsuario(u.id)}>🗑️</button>
  </div>
)}
              </div>
            )
          })}
        </div>

        <section className="seccion seccion-actuaciones-globales">
          <div className="seccion-header seccion-header-global">
            <div>
              <h2>Actuaciones del personal ({actuacionesFiltradas.length})</h2>
              <p className="seccion-ayuda">Consulta general de las actuaciones registradas por cada usuario.</p>
            </div>
            <input
              type="text"
              className="input-busqueda-inline"
              placeholder="Buscar por personal, número, lugar..."
              aria-label="Buscar actuaciones del personal"
              value={busquedaGlobal}
              onChange={function(e) { setBusquedaGlobal(e.target.value) }}
            />
          </div>

          {actuacionesFiltradas.length === 0 && (
            <p className="vacio">
              {textoBusqueda ? "No hay actuaciones que coincidan con la búsqueda" : "No hay actuaciones registradas"}
            </p>
          )}

          {actuacionesFiltradas.map(function(a) {
            return (
              <article key={a.id} className="actuacion-global-card">
                <div className="actuacion-global-info">
                  <div className="actuacion-global-numero">Actuación {a.numero}</div>
                  <div className="actuacion-global-caratula">{a.caratula}</div>
                  <div className="actuacion-global-detalle">
                    <span>{a.damnificado}</span>
                    <span>{a.lugar}</span>
                    <span>Fecha: {a.fecha_recepcion}</span>
                  </div>
                </div>
                <div className="responsable-actuacion">
                  <span className="responsable-etiqueta">Responsable</span>
                  <strong>{a.responsable_nombre}</strong>
                  <span>DNI {a.responsable_dni}</span>
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </div>
  )
}

export default Admin
