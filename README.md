# CSV Duplicate Checker

Minimal Next.js + Tailwind app to upload a CSV, select columns to compare, flag duplicate rows, view them in a scrollable table, and download results.

How to run (Windows PowerShell):

1. Install dependencies

```powershell
npm install
```

2. Run dev server

```powershell
npm run dev
```

Open http://localhost:3000

Notes and assumptions
- Uses PapaParse for CSV parsing on the client.
- Presets are provided for the two CSVs you mentioned; upload the corresponding CSV and click the preset to auto-select recommended columns.
- Duplicate detection is case-insensitive and trims whitespace when comparing.

Next steps / improvements
- Add true drag-and-drop support
- Add pagination/virtualization for very large CSVs
- Add settings for matching (case-sensitivity, trimming, null handling)
- Add unit tests for duplicateUtils

