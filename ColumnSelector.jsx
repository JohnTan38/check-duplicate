import React from 'react'

export default function ColumnSelector({ headers = [], selected = [], onChange }) {
  function toggle(h) {
    console.log('Toggle called for:', h)
    console.log('Current selected:', selected)
    console.log('onChange function:', typeof onChange)
    if (selected.includes(h)) onChange(selected.filter(s => s !== h))
    else onChange([...selected, h])
  }

  return (
    <div className="p-2 border rounded">
      <div className="text-sm font-medium mb-2">Select columns to compare</div>
      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
        {headers.map(h => (
          <label key={h} className="inline-flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={selected.includes(h)} 
              onChange={() => toggle(h)}
              className="cursor-pointer"
            />
            <span className="text-sm">{h}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
