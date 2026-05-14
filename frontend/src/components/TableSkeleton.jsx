import './TableSkeleton.css';

/**
 * Skeleton loader para tablas.
 * @param {number} rows       - Número de filas a mostrar (default 7)
 * @param {number} cols       - Número de columnas
 * @param {boolean} hasAvatar - Si la primera celda incluye un avatar circular
 * @param {boolean} noWrapper - Si true, no envuelve en <tbody> (úsalo cuando ya estás dentro de un <tbody>)
 */
function TableSkeleton({ rows = 7, cols = 5, hasAvatar = false, noWrapper = false }) {
  // Anchos variables para que las barras no sean todas iguales
  const widths = ['60%', '80%', '50%', '70%', '65%', '75%', '55%'];

  const filas = Array.from({ length: rows }).map((_, rowIdx) => (
    <tr key={rowIdx} className="sk-row">
      {Array.from({ length: cols }).map((_, colIdx) => (
        <td key={colIdx} className="sk-cell">
          {colIdx === 0 && hasAvatar ? (
            <div className="sk-cell-avatar">
              <div className="sk-avatar sk-shine" />
              <div className="sk-lines">
                <div className="sk-bar sk-shine" style={{ width: '70%' }} />
                <div className="sk-bar sk-shine" style={{ width: '45%', marginTop: '5px', height: '8px' }} />
              </div>
            </div>
          ) : colIdx === 0 ? (
            <div className="sk-lines">
              <div className="sk-bar sk-shine" style={{ width: widths[rowIdx % widths.length] }} />
              <div className="sk-bar sk-shine" style={{ width: '40%', marginTop: '5px', height: '8px' }} />
            </div>
          ) : (
            <div
              className="sk-bar sk-shine"
              style={{ width: widths[(rowIdx + colIdx) % widths.length] }}
            />
          )}
        </td>
      ))}
    </tr>
  ));

  if (noWrapper) return <>{filas}</>;
  return <tbody>{filas}</tbody>;
}

export default TableSkeleton;
