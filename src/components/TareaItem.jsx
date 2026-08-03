function TareaItem({ tarea, onToggle, onEliminar }) {
  return (
    <div className={`tarea-item ${tarea.completada ? 'completada' : ''}`}>
      <span
        className="tarea-check"
        onClick={() => onToggle(tarea.id, tarea.completada)}
      >
        {tarea.completada ? "✅" : "⬜"}
      </span>
      <span className="tarea-nombre">{tarea.nombre}</span>
      <button className="btn-eliminar-tarea" onClick={() => onEliminar(tarea.id)}>✕</button>
    </div>
  )
}

export default TareaItem