import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'https://actuaciones-backend-production.up.railway.app'
const etiquetas = { oficio_judicial: 'Oficios judiciales', inspeccion_ocular: 'Inspecciones oculares', colaboracion: 'Pedidos de colaboración', dcco: 'Identificaciones DCCO', ciberpatrullaje: 'Informes de ciberpatrullaje' }

function Tarjeta({ titulo, valor }) {
  return <article className="stats-metrica-card"><div className="stats-metrica-valor">{valor}</div><div className="stats-metrica-label">{titulo}</div></article>
}

function Estadisticas({ onToggleTema, tema }) {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const [anio, setAnio] = useState('')
  const [datos, setDatos] = useState(null)
  const [error, setError] = useState('')

  useEffect(function() {
    setDatos(null); setError('')
    fetch(API + '/estadisticas/resumen' + (anio ? '?anio=' + anio : ''), { headers: { Authorization: 'Bearer ' + token } })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(setDatos)
      .catch(() => setError('No se pudieron cargar las estadísticas'))
  }, [anio])

  function cerrarSesion() { localStorage.removeItem('token'); localStorage.removeItem('usuario'); navigate('/login') }
  const actividad = tipo => datos?.actividades.find(a => a.tipo === tipo)
  const anos = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - i))

  return <div className="dashboard">
    <header className="dashboard-header"><div className="header-left"><button onClick={() => navigate('/admin')} className="btn-volver">← Admin</button><h1>Estadísticas</h1></div><div className="header-right"><button onClick={onToggleTema} className="btn-tema">{tema === 'dark' ? '☀️' : '🌙'}</button><button onClick={cerrarSesion} className="btn-logout">Cerrar sesión</button></div></header>
    <main className="dashboard-content">
      <section className="stats-filtros stats-filtros-simple"><label className="field-label">Período<select className="stats-select" value={anio} onChange={e => setAnio(e.target.value)}><option value="">Todos los años</option>{anos.map(x => <option key={x}>{x}</option>)}</select></label></section>
      {error && <p className="error">{error}</p>}
      {!datos && !error && <p className="vacio">Calculando cantidades...</p>}
      {datos && <>
        <section><h2 className="stats-seccion-titulo">Actuaciones</h2><div className="stats-metricas"><Tarjeta titulo="Actuaciones registradas" valor={datos.actuaciones.total} /><Tarjeta titulo="Actuaciones elevadas" valor={datos.actuaciones.elevadas} /></div></section>
        <section><h2 className="stats-seccion-titulo">Allanamientos</h2><div className="stats-metricas"><Tarjeta titulo="Órdenes de allanamiento" valor={datos.allanamientos.ordenes} /><Tarjeta titulo="Domicilios allanados" valor={datos.allanamientos.domicilios} /><Tarjeta titulo="Detenidos" valor={datos.allanamientos.detenidos} /></div></section>
        <section><h2 className="stats-seccion-titulo">Actividad registrada</h2><div className="stats-metricas">{Object.entries(etiquetas).map(([tipo, titulo]) => <Tarjeta key={tipo} titulo={titulo} valor={tipo === 'dcco' ? (actividad(tipo)?.cantidad_total || 0) : (actividad(tipo)?.cantidad_registros || 0)} />)}</div></section>
      </>}
    </main>
  </div>
}
export default Estadisticas
