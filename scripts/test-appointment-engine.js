import assert from 'assert'
import { computeAvailableSlots } from '../server/index.js'

console.log('🧪 Starting Smart Appointment Engine Verification Tests...')

// Test 1: Fetch slots for valid therapist and future date
const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
// Find next Monday to Friday if weekend
while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
  tomorrow.setDate(tomorrow.getDate() + 1)
}
const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`


console.log(`📅 Testing availability for Dr. Priya Sharma (doc-1) on ${dateStr}...`)
const result = computeAvailableSlots('doc-1', dateStr)

assert.ok(result, 'Result should exist')
assert.strictEqual(result.isDayOff, false, 'Should not be day off')
assert.ok(Array.isArray(result.slots), 'Slots should be an array')
assert.ok(result.slots.length > 0, 'Should generate available time slots')

console.log(`✅ Generated ${result.slots.length} time slots successfully.`)

// Verify Lunch Break slot is marked unavailable
const lunchSlot = result.slots.find((s) => s.time.includes('1:00 PM') || s.time.includes('13:00'))
if (lunchSlot) {
  assert.strictEqual(lunchSlot.available, false, 'Lunch break slot should be unavailable')
  assert.strictEqual(lunchSlot.reason, 'Practitioner Break', 'Reason should be Practitioner Break')
  console.log('✅ Practitioner lunch break exclusion verified.')
}

// Test 2: Weekend Day Off Check
const sunday = new Date()
sunday.setDate(sunday.getDate() + (7 - sunday.getDay()))
const sundayStr = `${sunday.getFullYear()}-${String(sunday.getMonth() + 1).padStart(2, '0')}-${String(sunday.getDate()).padStart(2, '0')}`

const sundayResult = computeAvailableSlots('doc-1', sundayStr)

assert.strictEqual(sundayResult.isDayOff, true, 'Sunday should be day off for doc-1')
console.log('✅ Day off / weekend exclusion verified.')

// Test 3: Invalid therapist check
const invalidResult = computeAvailableSlots('invalid-doc', dateStr)
assert.ok(invalidResult.error, 'Should return error for invalid therapist')
console.log('✅ Invalid therapist validation verified.')

console.log('🎉 ALL SMART APPOINTMENT ENGINE TESTS PASSED SUCCESSFULLY!')
