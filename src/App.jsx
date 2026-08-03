import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import CambiarPassword from './pages/CambiarPassword'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

function App() {
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cambiar-password" element={<CambiarPassword />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={token && usuario.rol === 'admin' ? <Admin /> : <Navigate to="/login" />}
        />
        <Route
          path="*"
          element={<Navigate to={token ? (usuario.rol === 'admin' ? '/admin' : '/dashboard') : '/login'} />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App