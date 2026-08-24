import { useState } from 'react'

function FormActuacion({ onAgregar }) {
  const [form, setForm] = useState({
    numero: "",
    damnificado: "",
    lugar: "",
    caratula: "S/",
    fecha_recepcion: ""
  })
  const [abierto, setAbierto] = useState(false)

  async function handleSubmit() {
    if (!form.numero || !form.damnificado || !form.lugar || !form.caratula || !form.fecha_recepcion) return
    await onAgregar(form)
    setForm({ numero: "", damnificado: "", lugar: "", caratula: "S/", fecha_recepcion: "" })
    setAbierto(false)
  }

  return (
  <div className="form-adicional">
    <div className="form-header">
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
            onChange={function(e) { setForm({...form, numero: e.target.value.toUpperCase()}) }}
          />
          <div className="field-group">
            <label className="field-label">Fecha del hecho</label>
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
          onChange={function(e) { setForm({...form, damnificado: e.target.value.toUpperCase()}) }}
        />
        <input
          type="text"
          placeholder="Lugar de denuncia"
          value={form.lugar}
          onChange={function(e) { setForm({...form, lugar: e.target.value.toUpperCase()}) }}
        />
        <input
          type="text"
          placeholder="S/ Carátula"
          value={form.caratula}
          onChange={function(e) {
            const valor = e.target.value.toUpperCase()
            if (!valor.startsWith("S/")) return
            setForm({...form, caratula: valor})
             }}
        />
        <button onClick={handleSubmit} className="btn-registrar">Registrar actuación</button>
      </div>
    )}
  </div>
)

}

export default FormActuacion