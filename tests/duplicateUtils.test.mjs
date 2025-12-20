import test from 'node:test'
import assert from 'node:assert/strict'
import { flagDuplicates } from '../lib/duplicateUtils.js'

test('flags duplicates when selected columns match exactly', () => {
  const rows = [
    { CompanyCode: 'SG01', Number: '1001', Name: 'Vendor A' },
    { CompanyCode: 'SG01', Number: '1001', Name: 'Vendor A' },
    { CompanyCode: 'SG02', Number: '1002', Name: 'Vendor B' }
  ]

  const { duplicates, summary, flaggedRows } = flagDuplicates(rows, ['CompanyCode', 'Number', 'Name'])

  assert.equal(duplicates.length, 2)
  assert.equal(summary.length, 1)
  assert.equal(summary[0].dupGroup, 'G1')
  assert.equal(summary[0].count, 2)
  assert.equal(flaggedRows.filter(r => r.isDuplicate).length, 2)
})

test('treats rows with missing selected column values as unique', () => {
  const rows = [
    { CompanyCode: 'SG01', Number: '1001', Name: 'Vendor A' },
    { CompanyCode: 'SG01', Number: '', Name: 'Vendor A' },
    { CompanyCode: 'SG01', Name: 'Vendor A' }
  ]

  const { duplicates } = flagDuplicates(rows, ['CompanyCode', 'Number', 'Name'])

  assert.equal(duplicates.length, 0)
})

test('returns safe defaults when no columns selected', () => {
  const rows = [
    { CompanyCode: 'SG01', Number: '1001', Name: 'Vendor A' }
  ]

  const { duplicates, summary, flaggedRows } = flagDuplicates(rows, [])

  assert.equal(duplicates.length, 0)
  assert.equal(summary.length, 0)
  assert.equal(flaggedRows.length, 1)
  assert.equal(flaggedRows[0].isDuplicate, false)
})

test('supports multi-group duplicate detection', () => {
  const rows = [
    { CompanyCode: 'SG01', Number: '1001', Name: 'Vendor A' },
    { CompanyCode: 'SG01', Number: '1001', Name: 'Vendor A' },
    { CompanyCode: 'SG02', Number: '2001', Name: 'Vendor B' },
    { CompanyCode: 'SG02', Number: '2001', Name: 'Vendor B' }
  ]

  const { duplicates, summary } = flagDuplicates(rows, ['CompanyCode', 'Number'])

  assert.equal(duplicates.length, 4)
  assert.equal(summary.length, 2)
  const groupCounts = summary.map(item => item.count).sort()
  assert.deepEqual(groupCounts, [2, 2])
})
