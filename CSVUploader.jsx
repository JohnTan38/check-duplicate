import React, { useRef, useState, useCallback } from 'react'
import Papa from 'papaparse'

export default function CSVUploader({ onData, accept = 'text/csv' }) {
  const fileRef = useRef()
  const [isDragging, setIsDragging] = useState(false)

  const processFiles = useCallback((files) => {
    const f = files?.[0]
    if (!f) return
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        onData({ data: results.data, meta: results.meta, fileName: f.name })
      }
    })
  }, [onData])

  const handleFiles = useCallback((files) => {
    processFiles(files)
  }, [processFiles])

  const handleDrop = useCallback((event) => {
    event.preventDefault()
    setIsDragging(false)
    const files = event.dataTransfer?.files
    if (files?.length) processFiles(files)
  }, [processFiles])

  const handleDragOver = useCallback((event) => {
    event.preventDefault()
    if (!isDragging) setIsDragging(true)
  }, [isDragging])

  const handleDragLeave = useCallback((event) => {
    event.preventDefault()
    // only reset when leaving the drop zone, not entering children
    if (event.currentTarget.contains(event.relatedTarget)) return
    setIsDragging(false)
  }, [])

  const openFileDialog = useCallback(() => {
    if (fileRef.current) fileRef.current.click()
  }, [])

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openFileDialog()
    }
  }, [openFileDialog])

  return (
    <div
      className={`border-2 border-dashed rounded p-4 text-center transition-colors cursor-pointer ${isDragging ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFileDialog}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="text-sm">Drag and drop a CSV here or click to choose a file.</p>
      <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded" type="button">
        Choose CSV
      </button>
    </div>
  )
}
