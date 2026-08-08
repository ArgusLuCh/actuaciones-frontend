import { useState } from 'react'

function FormActuacion({ onAgregar }) {
  const [form, setForm] = useState({
    numero: "",
    damnificado: "",
    lugar: "",
    caratula: "",
    fecha_recepcion: ""
  })
  const [abierto, setAbierto] = useState(false)

  async function handleSubmit() {
    if (!form.numero || !form.damnificado || !form.lugar || !form.caratula || !form.fecha_recepcion) return
    await onAgregar(form)
    setForm({ numero: "", damnificado: "", lugar: "", caratula: "", fecha_recepcion: "" })
    setAbierto(false)
  }

  return (
    <div className="form-adicional">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Actuaciones</h2>
        <button onClick={() => setAbierto(!abierto)} className="btn-nuevo">
          {abierto ? "Cancelar" : "+ Nueva actuación"}
        </button>
      </div>

      {abierto && (
        <div className="form-grid-vertical">
          <div className="form-row">
            <input
              type="text"
              placeholder="N° de actuación"
              value={form.numero}
              onChange={function(e) { setForm({...form, numero: e.target.value}) }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha del hecho</label>
              <input
                type="date"
                value={form.fecha_recepcion}
                onChange={function(e) { setForm({...form, fecha_recepcion: e.target.value}) }}
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Damnificado"
            value={form.damnificado}
            onChange={function(e) { setForm({...form, damnificado: e.target.value}) }}
          />
          <input
            type="text"
            placeholder="Lugar de denuncia"
            value={form.lugar}
            onChange={function(e) { setForm({...form, lugar: e.target.value}) }}
          />
          <input
            type="text"
            placeholder="Carátula"
            value={form.caratula}
            onChange={function(e) { setForm({...form, caratula: e.target.value}) }}
          />
          <button onClick={handleSubmit} className="btn-registrar">Registrar actuación</button>
        </div>
      )}
    </div>
  )
}

export default FormActuacion