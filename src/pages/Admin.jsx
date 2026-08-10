import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API = "https://actuaciones-backend-production.up.railway.app"

function Admin() {
  const [usuarios, setUsuarios] = useState([])
  const [form, setForm] = useState({ nombre: "", dni: "" })
  const [error, setError] = useState("")
  const [mensaje, setMensaje] = useState("")
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  async function cargarUsuarios() {
    const res = await fetch(API + "/admin/usuarios", {
      headers: { Authorization: "Bearer " + token }
    })
    const datos = await res.json()
    setUsuarios(datos)
  }

  useEffect(function() {
    cargarUsuarios()
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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Panel de Administración</h1>
        <div className="header-right">
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
      </div>
    </div>
  )
}

export default Admin