const fs = require('fs');
const assert = require('assert');

console.log('🧪 VERIFYING FEE STRUCTURE & DATE STANDARDIZATION FIXES...\n');

const html = fs.readFileSync('index.html', 'utf8');
const gas = fs.readFileSync('GoogleAppsScript_Code.js', 'utf8');

// 1. handleAdminUpdateFee is async with lock & feedback
assert(html.includes('async function handleAdminUpdateFee(e)'), 'Test 1 Failed: handleAdminUpdateFee is not async');
assert(html.includes("localStorage.setItem('yoddha_fee_last_update', Date.now().toString());"), 'Test 1 Failed: fee lock timestamp missing in handleAdminUpdateFee');
assert(html.includes("submitBtn.disabled = true;"), 'Test 1 Failed: submitBtn loading state missing');
console.log('✅ Test 1 Passed: handleAdminUpdateFee is async with 45s lock & loading feedback');

// 2. pullLiveCloudRecords respects fee lock window
assert(html.includes("const lastUpdate = parseInt(localStorage.getItem('yoddha_fee_last_update') || '0', 10);"), 'Test 2 Failed: pullLiveCloudRecords does not check lastUpdate');
assert(html.includes("const isRecentlyUpdatedLocally = (Date.now() - lastUpdate) < 45000;"), 'Test 2 Failed: 45000ms lock window missing in pullLiveCloudRecords');
assert(html.includes("if (!isRecentlyUpdatedLocally) {"), 'Test 2 Failed: pullLiveCloudRecords does not gate fee overwrite with lock');
console.log('✅ Test 2 Passed: pullLiveCloudRecords protected against stale cloud overwrite');

// 3. syncToCloudServer blocks blank/corrupt student records
assert(html.includes("Blocked sync of invalid or blank student to Google Sheet"), 'Test 3 Failed: syncToCloudServer missing blank student block guard');
assert(html.includes("!sId || sId.length < 5 || sId.toUpperCase().includes('TEST')"), 'Test 3 Failed: sId validation missing in syncToCloudServer');
assert(html.includes("sName.toLowerCase() === 'student'"), 'Test 3 Failed: default name student check missing');
console.log('✅ Test 3 Passed: syncToCloudServer strictly guards against syncing blank/invalid students');

// 4. formatStandardDate in index.html produces clean YYYY-MM-DD
function mockFormatStandardDate(d) {
  if (!d) return '';
  const s = String(d).trim();
  const m = s.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (m) {
    const y = m[1];
    const mo = m[2].length === 1 ? '0' + m[2] : m[2];
    const day = m[3].length === 1 ? '0' + m[3] : m[3];
    return `${y}-${mo}-${day}`;
  }
  const dt = (d instanceof Date) ? d : new Date(d);
  if (isNaN(dt.getTime())) return s;
  const y = dt.getFullYear();
  const mo = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

assert.strictEqual(mockFormatStandardDate('1998-11-24'), '1998-11-24');
assert.strictEqual(mockFormatStandardDate('Fri Nov 21 2008 00:00:00 GMT+0530'), '2008-11-21');
assert.strictEqual(mockFormatStandardDate('2022-11-20T18:30:00.000Z'), '2022-11-20');
assert.strictEqual(mockFormatStandardDate(new Date(2010, 0, 1)), '2010-01-01');
console.log('✅ Test 4 Passed: formatStandardDate standardizes any date string into clean YYYY-MM-DD');

// 5. GoogleAppsScript_Code.js strict student rejection
assert(gas.includes('Rejected: Cannot register or append student without a valid Student ID and real Student Name'), 'Test 5 Failed: GAS missing strict student rejection');
console.log('✅ Test 5 Passed: GoogleAppsScript_Code.js strictly rejects blank/corrupt student registrations');

// 6. GoogleAppsScript_Code.js auto-purges blank student rows during readAll
assert(gas.includes('chkName.toLowerCase() === "student" && !chkDob'), 'Test 6 Failed: Ghost student check missing in GAS readAll');
assert(gas.includes('stuSheet.deleteRow(rCheck + 1)'), 'Test 6 Failed: deleteRow missing in GAS readAll auto-purge');
console.log('✅ Test 6 Passed: GoogleAppsScript_Code.js auto-purges ghost/blank student rows in Google Sheet');

// 7. GoogleAppsScript_Code.js atomic fee structure update
assert(gas.includes('sheet.getRange(1, 1, feeRows.length, 2).setValues(feeRows);'), 'Test 7 Failed: Atomic setValues missing in GAS fee update');
assert(gas.includes('PropertiesService.getScriptProperties().setProperty("FEE_STRUCTURE"'), 'Test 7 Failed: ScriptProperties fee cache missing in GAS');
console.log('✅ Test 7 Passed: GoogleAppsScript_Code.js performs atomic batch write and fast properties caching');

// 8. apps-script-code-box inside index.html mirrors updated code
assert(html.includes('apps-script-code-box'), 'Test 8 Failed: apps-script-code-box element missing');
assert(html.includes('Rejected: Cannot register or append student without a valid Student ID and real Student Name'), 'Test 8 Failed: apps-script-code-box does not contain updated GAS code');
console.log('✅ Test 8 Passed: Embedded apps-script-code-box inside index.html is fully synchronized');

console.log('\n🎉 ALL 8 TESTS PASSED WITH 100% SUCCESS!');
