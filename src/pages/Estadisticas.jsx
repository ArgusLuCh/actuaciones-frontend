import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const API = "https://actuaciones-backend-production.up.railway.app"

function Estadisticas({ onToggleTema, tema }) {
  const [actuaciones, setActuaciones] = useState([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // Filtros
  const [filtroAnio, setFiltroAnio] = useState('')
  const [filtroCaratula, setFiltroCaratula] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroActuario, setFiltroActuario] = useState('')

  useEffect(function() {
    fetch(API + "/estadisticas", {
      headers: { Authorization: "Bearer " + token }
    })
    .then(function(res) { return res.json() })
    .then(function(datos) {
      setActuaciones(datos)
      setCargando(false)
    })
    .catch(function() { setCargando(false) })
  }, [])

  // Opciones únicas para filtros
  const anios = useMemo(function() {
    const set = new Set(actuaciones.map(function(a) {
      return a.fecha_recepcion ? a.fecha_recepcion.substring(0, 4) : null
    }).filter(Boolean))
    return [...set].sort().reverse()
  }, [actuaciones])

  const caratulas = useMemo(function() {
    const base = filtroAnio
      ? actuaciones.filter(function(a) { return a.fecha_recepcion?.startsWith(filtroAnio) })
      : actuaciones
    const set = new Set(base.map(function(a) { return a.caratula }))
    return [...set].sort()
  }, [actuaciones, filtroAnio])

  const actuarios = useMemo(function() {
    const set = new Set(actuaciones.map(function(a) { return a.actuario_nombre }))
    return [...set].sort()
  }, [actuaciones])

  // Aplicar filtros encadenados
  const filtradas = useMemo(function() {
    return actuaciones.filter(function(a) {
      if (filtroAnio && !a.fecha_recepcion?.startsWith(filtroAnio)) return false
      if (filtroCaratula && a.caratula !== filtroCaratula) return false
      if (filtroEstado === 'elevada' && !a.elevada) return false
      if (filtroEstado === 'en_base' && a.elevada) return false
      if (filtroActuario && a.actuario_nombre !== filtroActuario) return false
      return true
    })
  }, [actuaciones, filtroAnio, filtroCaratula, filtroEstado, filtroActuario])

  // Métricas
  const total = filtradas.length
  const elevadas = filtradas.filter(function(a) { return a.elevada }).length
  const enBase = total - elevadas

  // Distribución por carátula para el gráfico
  const distribucion = useMemo(function() {
    const mapa = {}
    filtradas.forEach(function(a) {
      mapa[a.caratula] = (mapa[a.caratula] || 0) + 1
    })
    return Object.entries(mapa)
      .sort(function(a, b) { return b[1] - a[1] })
      .slice(0, 10)
  }, [filtradas])

  const maxValor = distribucion.length > 0 ? distribucion[0][1] : 1

  function limpiarFiltros() {
    setFiltroAnio('')
    setFiltroCaratula('')
    setFiltroEstado('')
    setFiltroActuario('')
  }

  function cerrarSesion() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    navigate('/login')
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <button onClick={() => navigate('/admin')} className="btn-volver">← Admin</button>
          <h1>Estadísticas</h1>
        </div>
        <div className="header-right">
          <button onClick={onToggleTema} className="btn-tema">
            {tema === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={cerrarSesion} className="btn-logout">Cerrar sesión</button>
        </div>
      </header>

      <div className="dashboard-content">

        {/* FILTROS */}
        <div className="stats-filtros">
          <div className="stats-filtros-grid">
            <div className="field-group">
              <label className="field-label">Año</label>
              <select
                className="stats-select"
                value={filtroAnio}
                onChange={function(e) {
                  setFiltroAnio(e.target.value)
                  setFiltroCaratula('')
                }}
              >
                <option value="">Todos los años</option>
                {anios.map(function(a) {
                  return <option key={a} value={a}>{a}</option>
                })}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Carátula</label>
              <select
                className="stats-select"
                value={filtroCaratula}
                onChange={function(e) { setFiltroCaratula(e.target.value) }}
              >
                <option value="">Todas</option>
                {caratulas.map(function(c) {
                  return <option key={c} value={c}>{c}</option>
                })}
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Estado</label>
              <select
                className="stats-select"
                value={filtroEstado}
                onChange={function(e) { setFiltroEstado(e.target.value) }}
              >
                <option value="">Todos</option>
                <option value="en_base">En base</option>
                <option value="elevada">Elevadas</option>
              </select>
            </div>

            <div className="field-group">
              <label className="field-label">Actuario</label>
              <select
                className="stats-select"
                value={filtroActuario}
                onChange={function(e) { setFiltroActuario(e.target.value) }}
              >
                <option value="">Todos</option>
                {actuarios.map(function(a) {
                  return <option key={a} value={a}>{a}</option>
                })}
              </select>
            </div>
          </div>

          {(filtroAnio || filtroCaratula || filtroEstado || filtroActuario) && (
            <button onClick={limpiarFiltros} className="btn-limpiar-filtros">
              ✕ Limpiar filtros
            </button>
          )}
        </div>

        {/* MÉTRICAS */}
        <div className="stats-metricas">
          <div className="stats-metrica-card">
            <div className="stats-metrica-valor">{total}</div>
            <div className="stats-metrica-label">Total actuaciones</div>
          </div>
          <div className="stats-metrica-card">
            <div className="stats-metrica-valor stats-valor-base">{enBase}</div>
            <div className="stats-metrica-label">En base</div>
          </div>
          <div className="stats-metrica-card">
            <div className="stats-metrica-valor stats-valor-elevada">{elevadas}</div>
            <div className="stats-metrica-label">Elevadas</div>
          </div>
          <div className="stats-metrica-card">
            <div className="stats-metrica-valor">
              {total > 0 ? Math.round((elevadas / total) * 100) : 0}%
            </div>
            <div className="stats-metrica-label">Tasa de elevación</div>
          </div>
        </div>

        {/* GRÁFICO POR CARÁTULA */}
        {distribucion.length > 0 && (
          <div className="stats-grafico-card">
            <h3 className="stats-seccion-titulo">Distribución por carátula</h3>
            <div className="stats-barras">
              {distribucion.map(function(item) {
                const porcentaje = Math.round((item[1] / maxValor) * 100)
                return (
                  <div key={item[0]} className="stats-barra-row">
                    <div className="stats-barra-label">{item[0]}</div>
                    <div className="stats-barra-track">
                      <div
                        className="stats-barra-fill"
                        style={{ width: porcentaje + '%' }}
                      />
                    </div>
                    <div className="stats-barra-valor">{item[1]}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TABLA DE RESULTADOS */}
        <div className="stats-tabla-card">
          <h3 className="stats-seccion-titulo">
            Actuaciones ({filtradas.length})
          </h3>
          {cargando && <p className="vacio">Cargando...</p>}
          {!cargando && filtradas.length === 0 && (
            <p className="vacio">No hay actuaciones con los filtros seleccionados</p>
          )}
          {!cargando && filtradas.length > 0 && (
            <div className="stats-tabla">
              <div className="stats-tabla-header">
                <span>N° Actuación</span>
                <span>Carátula</span>
                <span>Damnificado</span>
                <span>Fecha</span>
                <span>Actuario</span>
                <span>Estado</span>
              </div>
              {filtradas.map(function(a) {
                return (
                  <div key={a.id} className="stats-tabla-row">
                    <span className="stats-tabla-numero">{a.numero}</span>
                    <span className="stats-tabla-caratula">{a.caratula}</span>
                    <span>{a.damnificado}</span>
                    <span>{a.fecha_recepcion}</span>
                    <span>{a.actuario_nombre}</span>
                    <span>
                      {a.elevada
                        ? <span className="badge-elevada">Elevada</span>
                        : <span className="badge-en-base">En base</span>
                      }
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Estadisticas