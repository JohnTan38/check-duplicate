/**
 * Given rows (array of objects) and selected columns, return duplicate insights.
 * The function is defensive so it can be reused for any CSV-like dataset.
 *
 * @param {Array<Record<string, unknown>>} rows
 * @param {Array<string>} columns
 * @returns {{
 *   flaggedRows: Array<Record<string, unknown>>,
 *   duplicates: Array<Record<string, unknown>>,
 *   summary: Array<{ dupGroup: string, count: number, columns: Record<string, string> }>
 * }}
 */
export function flagDuplicates(rows, columns) {
  const safeRows = Array.isArray(rows) ? rows : []
  const safeColumns = Array.isArray(columns) ? columns.filter(Boolean) : []

  const baseRows = safeRows.map(r => ({ ...r, isDuplicate: false, dupGroup: null }))
  if (!safeColumns.length) {
    return {
      flaggedRows: baseRows,
      duplicates: [],
      summary: []
    }
  }

  const normalize = (value) => {
    if (value === null || value === undefined) return ''
    return value.toString().trim().toLowerCase()
  }

  const columnSnapshot = (row) => safeColumns.reduce((acc, col) => {
    acc[col] = row[col] ?? ''
    return acc
  }, {})

  const keyMap = new Map()
  safeRows.forEach((row, idx) => {
    const normalizedValues = safeColumns.map(col => normalize(row[col]))
    const missingCriticalValue = normalizedValues.some(val => val === '')

    if (missingCriticalValue) return

    const key = normalizedValues.join('||')
    if (!keyMap.has(key)) keyMap.set(key, [])
    keyMap.get(key).push(idx)
  })

  let groupCounter = 1
  const duplicates = []
  const summary = []

  for (const [key, idxs] of keyMap.entries()) {
    if (idxs.length < 2) continue

    const dupGroup = `G${groupCounter++}`
    const snapshot = columnSnapshot(safeRows[idxs[0]])

    summary.push({
      dupGroup,
      count: idxs.length,
      columns: snapshot
    })

    idxs.forEach((rowIdx) => {
      baseRows[rowIdx].isDuplicate = true
      baseRows[rowIdx].dupGroup = dupGroup
      duplicates.push(baseRows[rowIdx])
    })
  }

  return {
    flaggedRows: baseRows,
    duplicates,
    summary
  }
}
