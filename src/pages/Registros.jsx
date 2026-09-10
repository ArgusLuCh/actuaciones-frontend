import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API = 'https://actuaciones-backend-production.up.railway.app'
const tipos = [
  ['actuacion', 'Actuación'],
  ['allanamiento', 'Allanamiento'], ['oficio_judicial', 'Oficio judicial'],
  ['inspeccion_ocular', 'Inspección ocular'], ['colaboracion', 'Colaboración'], ['dcco', 'Cantidad DCCO']
]

const inicial = { tipo: 'allanamiento', numero: '', numero_interno: '', referencia: '', fecha_ingreso: '', fecha_recepcion: '', caratula: '', fiscalia: '', actuario: '', actuario_responsable: '', causa: '', acusados: '', damnificado: '', lugar: '', diligencia: '', resultado: '', elevacion: '', destino_elevacion: '', capital_interior: '', cantidad: '', observaciones: '', domicilios: [] }

function Campo({ etiqueta, nombre, form, setForm, tipo = 'text', opciones = [] }) {
  return <label className="registro-campo">{etiqueta}
    {tipo === 'select'
      ? <select value={form[nombre]} onChange={e => setForm({ ...form, [nombre]: e.target.value })}><option value="">Seleccionar</option>{opciones.map(x => <option key={x}>{x}</option>)}</select>
      : <input type={tipo} value={form[nombre]} onChange={e => setForm({ ...form, [nombre]: e.target.value })} />}
  </label>
}

function Registros() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const esAdmin = usuario.rol === 'admin'
  const [form, setForm] = useState(inicial)
  const [domicilio, setDomicilio] = useState({ domicilio: '', localidad: '', resultado: '', detenidos: 0, secuestros: [] })
  const [secuestro, setSecuestro] = useState({ cantidad: '', tipo: '' })
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [posibles, setPosibles] = useState([])

  function cambiarTipo(tipo) { setForm({ ...inicial, tipo }) ; setDomicilio({ domicilio: '', localidad: '', resultado: '', detenidos: 0, secuestros: [] }); setError(''); setMensaje('') }
  function agregarDomicilio() {
    if (!domicilio.domicilio.trim()) return setError('Ingresá el domicilio antes de agregarlo')
    if (form.domicilios.some(d => d.domicilio.trim().toUpperCase() === domicilio.domicilio.trim().toUpperCase())) return setError('Ese domicilio ya fue cargado')
    setForm({ ...form, domicilios: [...form.domicilios, domicilio] }); setDomicilio({ domicilio: '', localidad: '', resultado: '', detenidos: 0, secuestros: [] }); setError('')
  }
  function agregarSecuestro() {
    if (!secuestro.cantidad || !secuestro.tipo.trim()) return setError('Completá cantidad y tipo de secuestro')
    setDomicilio({ ...domicilio, secuestros: [...domicilio.secuestros, { cantidad: Number(secuestro.cantidad), tipo: secuestro.tipo.trim() }] })
    setSecuestro({ cantidad: '', tipo: '' }); setError('')
  }
  async function revisarYGuardar(confirmar = false) {
    setError(''); setMensaje('')
    if (form.tipo === 'actuacion') {
      if (!form.actuario_responsable.trim()) return setError('Ingresá el actuario responsable')
      const res = await fetch(API + '/actuaciones', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(form) })
      const datos = await res.json()
      if (!res.ok) return setError(datos.error || 'No se pudo registrar la actuación')
      setMensaje('Actuación registrada correctamente'); cambiarTipo('actuacion')
      return
    }
    if (!confirmar && form.tipo !== 'dcco') {
      const params = new URLSearchParams({ tipo: form.tipo, numero_interno: form.numero_interno, referencia: form.referencia, causa: form.causa })
      const respuesta = await fetch(API + '/registros-actividad/posibles-duplicados?' + params, { headers: { Authorization: 'Bearer ' + token } })
      const datos = await respuesta.json()
      if (datos.length) return setPosibles(datos)
    }
    const res = await fetch(API + '/registros-actividad', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(form) })
    const datos = await res.json()
    if (!res.ok) return setError(datos.error || 'No se pudo guardar el registro')
    setMensaje('Registro guardado correctamente'); cambiarTipo(form.tipo); setPosibles([])
  }
  const esAllanamiento = form.tipo === 'allanamiento'
  const tiposVisibles = esAdmin ? tipos : tipos.filter(([valor]) => valor !== 'actuacion')
  return <div className="dashboard">
    <header className="dashboard-header"><div><button className="btn-volver" onClick={() => navigate(-1)}>← Volver</button><h1>Registro de actividad</h1></div></header>
    <main className="dashboard-content registro-contenido">
      <div className="registro-tipos">{tiposVisibles.map(([valor, etiqueta]) => <button key={valor} className={form.tipo === valor ? 'registro-tipo activo' : 'registro-tipo'} onClick={() => cambiarTipo(valor)}>{etiqueta}</button>)}</div>
      {error && <p className="error">{error}</p>}{mensaje && <p className="success">{mensaje}</p>}
      {posibles.length > 0 && <div className="registro-duplicado"><strong>Posible registro repetido</strong><p>Ya existe: {posibles.map(p => p.numero_interno || p.referencia).join(', ')}. Revisalo antes de continuar.</p><button onClick={() => setPosibles([])}>Cancelar</button><button className="btn-registrar" onClick={() => revisarYGuardar(true)}>Registrar de todos modos</button></div>}
      <section className="form-adicional registro-formulario">
        <h2>{tipos.find(x => x[0] === form.tipo)[1]}</h2>
        {form.tipo === 'actuacion' && <div className="registro-grid">
          <Campo etiqueta="N.º de actuación / denuncia" nombre="numero" form={form} setForm={setForm} />
          <Campo etiqueta="Fecha de recepción" nombre="fecha_recepcion" form={form} setForm={setForm} tipo="date" />
          <Campo etiqueta="Damnificado" nombre="damnificado" form={form} setForm={setForm} />
          <Campo etiqueta="Lugar de denuncia" nombre="lugar" form={form} setForm={setForm} />
          <Campo etiqueta="Carátula" nombre="caratula" form={form} setForm={setForm} />
          <Campo etiqueta="Actuario responsable" nombre="actuario_responsable" form={form} setForm={setForm} />
        </div>}
        {form.tipo !== 'actuacion' && (form.tipo === 'dcco' ? <Campo etiqueta="Cantidad" nombre="cantidad" form={form} setForm={setForm} tipo="number" /> : <div className="registro-grid">
          {form.tipo !== 'allanamiento' && <Campo etiqueta="N.º interno" nombre="numero_interno" form={form} setForm={setForm} />}
          {form.tipo !== 'dcco' && <Campo etiqueta="Fecha de ingreso" nombre="fecha_ingreso" form={form} setForm={setForm} tipo="date" />}
          {(esAllanamiento || form.tipo === 'oficio_judicial') && <Campo etiqueta="Actuación o reporte NMCEC" nombre="referencia" form={form} setForm={setForm} />}
          {form.tipo === 'inspeccion_ocular' && <><Campo etiqueta="N.º de expediente" nombre="referencia" form={form} setForm={setForm} /><Campo etiqueta="Actuación" nombre="causa" form={form} setForm={setForm} /></>}
          {form.tipo === 'colaboracion' && <Campo etiqueta="N.º de expediente o nota" nombre="referencia" form={form} setForm={setForm} />}
          {esAllanamiento && <Campo etiqueta="Causa" nombre="causa" form={form} setForm={setForm} />}
          {!esAllanamiento && form.tipo !== 'dcco' && <Campo etiqueta="Carátula" nombre="caratula" form={form} setForm={setForm} />}
          {form.tipo !== 'dcco' && <Campo etiqueta="Fiscalía" nombre="fiscalia" form={form} setForm={setForm} />}
          {esAllanamiento && <><Campo etiqueta="Acusados" nombre="acusados" form={form} setForm={setForm} /><Campo etiqueta="Damnificado" nombre="damnificado" form={form} setForm={setForm} /><Campo etiqueta="Capital o interior" nombre="capital_interior" form={form} setForm={setForm} tipo="select" opciones={['Capital', 'Interior']} /><Campo etiqueta="Resultado de elevación" nombre="resultado" form={form} setForm={setForm} tipo="select" opciones={['Esclarecida', 'NN']} /></>}
          {!esAllanamiento && form.tipo !== 'dcco' && <><Campo etiqueta="Diligencia" nombre="diligencia" form={form} setForm={setForm} /><Campo etiqueta="Actuario" nombre="actuario" form={form} setForm={setForm} />{(form.tipo === 'oficio_judicial' || form.tipo === 'inspeccion_ocular') && <Campo etiqueta={form.tipo === 'inspeccion_ocular' ? 'Citado o acusado' : 'Datos del acusado'} nombre="acusados" form={form} setForm={setForm} />}{form.tipo === 'oficio_judicial' && <><Campo etiqueta="Resultado" nombre="resultado" form={form} setForm={setForm} tipo="select" opciones={['Pendiente', 'Positivo', 'Negativo']} /><Campo etiqueta="Elevación" nombre="elevacion" form={form} setForm={setForm} /><Campo etiqueta="Destino de elevación" nombre="destino_elevacion" form={form} setForm={setForm} /></>}{form.tipo === 'inspeccion_ocular' && <Campo etiqueta="Elevación" nombre="elevacion" form={form} setForm={setForm} />}</>}
        </div>)}
        {esAllanamiento && <section className="domicilios"><h3>Domicilios allanados ({form.domicilios.length})</h3><div className="registro-grid"><Campo etiqueta="Domicilio" nombre="domicilio" form={domicilio} setForm={setDomicilio} /><Campo etiqueta="Localidad" nombre="localidad" form={domicilio} setForm={setDomicilio} /><Campo etiqueta="Resultado" nombre="resultado" form={domicilio} setForm={setDomicilio} /><Campo etiqueta="Detenidos" nombre="detenidos" form={domicilio} setForm={setDomicilio} tipo="number" /><Campo etiqueta="Cantidad de secuestro" nombre="cantidad" form={secuestro} setForm={setSecuestro} tipo="number" /><Campo etiqueta="Tipo de secuestro" nombre="tipo" form={secuestro} setForm={setSecuestro} /></div><button onClick={agregarSecuestro}>+ Agregar secuestro</button>{domicilio.secuestros.map((s, i) => <p key={i}>{s.cantidad} · {s.tipo} <button onClick={() => setDomicilio({ ...domicilio, secuestros: domicilio.secuestros.filter((_, x) => x !== i) })}>Quitar</button></p>)}<button onClick={agregarDomicilio}>+ Agregar domicilio</button>{form.domicilios.map((d, i) => <p key={i}>{d.domicilio} · {d.localidad || 'Sin localidad'} · {d.resultado || 'Sin resultado'} · {d.detenidos || 0} detenidos · {d.secuestros.length} secuestro(s) <button onClick={() => setForm({ ...form, domicilios: form.domicilios.filter((_, x) => x !== i) })}>Quitar</button></p>)}</section>}
        {form.tipo !== 'dcco' && form.tipo !== 'actuacion' && <label className="registro-campo">Observaciones<textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} /></label>}
        <button className="btn-registrar" onClick={() => revisarYGuardar()}>Registrar</button>
      </section>
    </main>
  </div>
}
export default Registros
