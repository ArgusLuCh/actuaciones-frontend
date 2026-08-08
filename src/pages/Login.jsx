import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = "https://actuaciones-backend-production.up.railway.app"

function Login() {
  const [form, setForm] = useState({ dni: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleLogin() {
    setLoading(true)
    const res = await fetch(API + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    const datos = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(datos.error)
      return
    }

    localStorage.setItem('token', datos.token)
    localStorage.setItem('usuario', JSON.stringify(datos.usuario))

    if (datos.usuario.debe_cambiar_password) {
      navigate('/cambiar-password')
    } else if (datos.usuario.rol === 'admin') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sistema de Actuaciones</h1>
        <h2>Iniciar sesión</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="DNI"
          value={form.dni}
          onChange={function(e) { setForm({...form, dni: e.target.value}) }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={function(e) { setForm({...form, password: e.target.value}) }}
          onKeyDown={function(e) { if (e.key === 'Enter') handleLogin() }}
        />
        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  )
}

export default Login