import React, { useEffect, useMemo, useState } from 'react'

export default function DupTable({
  rows = [],
  headers = [],
  selectedColumns = [],
  summary = [],
  totalRows = 0,
  onDownload
}) {
  const duplicatesCount = rows.length
  const groupsCount = summary.length
  const hasDuplicates = duplicatesCount > 0
  const columnsLabel = selectedColumns.length ? selectedColumns.join(', ') : 'No columns selected'
  const pageSizeOptions = [25, 50, 100, 200, 500]

  const [pageSize, setPageSize] = useState(pageSizeOptions[2])
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [rows])

  useEffect(() => {
    if (!hasDuplicates) {
      setPage(1)
      return
    }
    const calculatedPages = Math.max(1, Math.ceil(duplicatesCount / pageSize))
    if (page > calculatedPages) setPage(calculatedPages)
  }, [duplicatesCount, hasDuplicates, page, pageSize])

  const totalPages = hasDuplicates ? Math.max(1, Math.ceil(duplicatesCount / pageSize)) : 1

  const paginatedRows = useMemo(() => {
    if (!hasDuplicates) return []
    const start = (page - 1) * pageSize
    return rows.slice(start, start + pageSize)
  }, [hasDuplicates, page, pageSize, rows])

  const startRow = hasDuplicates ? (page - 1) * pageSize + 1 : 0
  const endRow = hasDuplicates ? Math.min(page * pageSize, duplicatesCount) : 0

  function handlePageChange(nextPage) {
    if (nextPage < 1 || nextPage > totalPages) return
    setPage(nextPage)
  }

  return (
    <div className="bg-white rounded border p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap justify-between items-start gap-3 text-sm">
        <div>
          <div className="font-medium">
            {hasDuplicates
              ? `${duplicatesCount} duplicate row${duplicatesCount > 1 ? 's' : ''} across ${groupsCount} group${groupsCount !== 1 ? 's' : ''}`
              : 'No duplicates found'}
          </div>
          <div className="text-gray-600">
            Dataset rows: {totalRows}
          </div>
          <div className="text-gray-600">
            Compared columns: {columnsLabel}
          </div>
        </div>
        <button
          onClick={onDownload}
          disabled={!hasDuplicates}
          className={`px-3 py-1 rounded ${hasDuplicates ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
        >
          Download CSV
        </button>
      </div>

      {hasDuplicates ? (
        <>
          <div className="mb-3 flex flex-wrap justify-between items-center gap-3 text-sm">
            <div>
              Showing {startRow}-{endRow} of {duplicatesCount}
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="dup-page-size" className="text-gray-600">Rows per page</label>
              <select
                id="dup-page-size"
                className="border rounded px-2 py-1"
                value={pageSize}
                onChange={(event) => {
                  const value = Number(event.target.value)
                  setPageSize(value)
                  setPage(1)
                }}
              >
                {pageSizeOptions.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border rounded scroll-table">
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">dupGroup</th>
                  {headers.map(h => (
                    <th key={h} className="p-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((r, i) => (
                  <tr key={`${r.dupGroup}-${startRow + i}`} className="odd:bg-yellow-50">
                    <td className="p-2 align-top">{startRow + i}</td>
                    <td className="p-2 align-top font-medium">{r.dupGroup}</td>
                    {headers.map(h => (
                      <td key={h} className="p-2 align-top break-words max-w-xs">{r[h] ?? ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {summary.length > 0 && (
            <div className="mt-4">
              <div className="font-medium text-sm mb-2">Duplicate summary</div>
              <div className="border rounded max-h-48 overflow-auto">
                <table className="min-w-full table-auto text-sm">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">dupGroup</th>
                      <th className="p-2 text-left">Rows</th>
                      <th className="p-2 text-left">Column values</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.map(item => (
                      <tr key={item.dupGroup} className="odd:bg-gray-50">
                        <td className="p-2 align-top font-medium">{item.dupGroup}</td>
                        <td className="p-2 align-top">{item.count}</td>
                        <td className="p-2 align-top break-words">
                          {Object.entries(item.columns)
                            .map(([col, value]) => `${col}: ${value ?? ''}`)
                            .join(' | ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-3 flex flex-wrap justify-between items-center gap-3 text-sm">
            <div>Page {page} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
              >
                Previous
              </button>
              <button
                className="px-2 py-1 border rounded disabled:opacity-50"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="border rounded bg-gray-50 p-4 text-sm text-gray-600">
          Upload a CSV and choose columns to see duplicate rows here.
        </div>
      )}
    </div>
  )
}
