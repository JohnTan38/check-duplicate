import React, { useState, useMemo } from 'react'
import Head from 'next/head'
import Papa from 'papaparse'
import CSVUploader from '../components/CSVUploader'
import ColumnSelector from '../components/ColumnSelector'
import DupTable from '../components/DupTable'
import { flagDuplicates } from '../lib/duplicateUtils'

export default function Home() {
  const [fileData, setFileData] = useState({ data: [], meta: null, fileName: '' })
  const [selectedCols, setSelectedCols] = useState([])

  const headers = useMemo(() => {
    return fileData.meta?.fields ?? []
  }, [fileData])

  const { flaggedRows, duplicates, summary } = useMemo(
    () => flagDuplicates(fileData.data || [], selectedCols),
    [fileData, selectedCols]
  )

  function handleData(payload) {
    setFileData(payload)
    setSelectedCols([])
  }

  function downloadCSV(rows = duplicates, suffix = 'duplicates') {
    if (!rows?.length) {
      alert('No duplicate rows to download yet.')
      return
    }

    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const baseName = fileData.fileName ? fileData.fileName.replace(/\.csv$/i, '') : 'export'
    a.download = `${baseName}_${suffix}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Example presets for the two provided CSV names (user still must upload the file first)
  const presets = [
    { name: 'Vendors example', file: 'S2P - Vendors.csv', cols: ['CompanyCode', 'Number', 'Name'] },
    { name: 'G_L accounts example', file: '[Manual Import] S2P - G_L accounts.csv', cols: ['CompanyCode', 'Account', 'Description', 'Z_CodingBlock'] }
  ]

  function applyPreset(p) {
    // only apply if headers include all preset cols
    if (!headers.length) return alert('Upload corresponding CSV first')
    const missing = p.cols.filter(c => !headers.includes(c))
    if (missing.length) return alert('Missing columns in uploaded CSV: ' + missing.join(', '))
    setSelectedCols(p.cols)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Head>
        <title>CSV Duplicate Check</title>
      </Head>
      <h1 className="text-2xl font-bold mb-4">CSV Duplicate Check</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <CSVUploader onData={handleData} />
          <div className="mt-3 text-sm text-gray-600">Uploaded: {fileData.fileName ?? 'none'}</div>
        </div>

        <div>
          <ColumnSelector headers={headers} selected={selectedCols} onChange={setSelectedCols} />
          <div className="mt-2 flex space-x-2">
            {presets.map(p => (
              <button key={p.name} className="px-2 py-1 border rounded text-sm" onClick={() => applyPreset(p)}>{p.name}</button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <DupTable
          rows={duplicates}
          headers={headers}
          selectedColumns={selectedCols}
          summary={summary}
          totalRows={flaggedRows.length}
          onDownload={() => downloadCSV(duplicates, 'duplicates')}
        />
      </div>
    </div>
  )
}
