import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = "http://localhost:3000"

function CambiarPassword() {
  const [form, setForm] = useState({ password_nueva: "", confirmar: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  async function handleCambiar() {
    if (form.password_nueva !== form.confirmar) {
      setError("Las contraseñas no coinciden")
      return
    }
    if (form.password_nueva.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)
    const res = await fetch(API + "/auth/cambiar-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({ password_nueva: form.password_nueva })
    })
    setLoading(false)

    if (!res.ok) {
      setError("Error al cambiar la contraseña")
      return
    }

    // Actualizar el usuario en localStorage
    const usuarioActualizado = { ...usuario, debe_cambiar_password: 0 }
    localStorage.setItem('usuario', JSON.stringify(usuarioActualizado))

    navigate('/dashboard')
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sistema de Actuaciones</h1>
        <h2>Cambiá tu contraseña</h2>
        <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>
          Es tu primer ingreso. Por seguridad, debés cambiar tu contraseña.
        </p>
        {error && <p className="error">{error}</p>}
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={form.password_nueva}
          onChange={function(e) { setForm({...form, password_nueva: e.target.value}) }}
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={form.confirmar}
          onChange={function(e) { setForm({...form, confirmar: e.target.value}) }}
          onKeyDown={function(e) { if (e.key === 'Enter') handleCambiar() }}
        />
        <button onClick={handleCambiar} disabled={loading}>
          {loading ? "Guardando..." : "Guardar contraseña"}
        </button>
      </div>
    </div>
  )
}

export default CambiarPassword