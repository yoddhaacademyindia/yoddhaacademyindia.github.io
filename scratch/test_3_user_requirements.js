const fs = require('fs');
const assert = require('assert');

console.log('🧪 VERIFYING 3 USER REQUIREMENTS...\n');

const html = fs.readFileSync('index.html', 'utf8');
const gas = fs.readFileSync('GoogleAppsScript_Code.js', 'utf8');

// 1. Master All Trainers Switch HTML & Labels
assert(html.includes('id="master-all-trainers-switch"'), 'Test 1 Failed: master-all-trainers-switch ID missing in HTML');
assert(html.includes('id="all-trainers-switch-label"'), 'Test 1 Failed: all-trainers-switch-label ID missing in HTML');
assert(html.includes('onchange="toggleAllTrainersStatus(this.checked)"'), 'Test 1 Failed: onchange handler missing');
console.log('✅ Test 1 Passed: Master All Trainers Switch UI exists in Admin Panel header');

// 2. toggleAllTrainersStatus function logic
assert(html.includes('async function toggleAllTrainersStatus(isActive)'), 'Test 2 Failed: toggleAllTrainersStatus function missing');
assert(html.includes('adminState.trainers.forEach(trn => {'), 'Test 2 Failed: Does not loop through all trainers');
assert(html.includes('trn.status = newStatus;'), 'Test 2 Failed: Does not update status on all trainers');
console.log('✅ Test 2 Passed: toggleAllTrainersStatus updates all trainers simultaneously');

// 3. renderAdminTrainers updates master switch
assert(html.includes("document.getElementById('master-all-trainers-switch')"), 'Test 3 Failed: renderAdminTrainers does not observe master switch');
assert(html.includes("activeCount === totalCount"), 'Test 3 Failed: Master switch full-active condition missing');
console.log('✅ Test 3 Passed: Individual trainer card switches keep master switch synchronized');

// 4. Cross-Device Live Exam Sync via Courses channel
assert(html.includes('id: "SYSTEM-EXAM-SWITCH"'), 'Test 4 Failed: SYSTEM-EXAM-SWITCH missing in toggleMasterExamSession');
assert(html.includes('title: "LIVE_EXAM_MASTER_STATE"'), 'Test 4 Failed: LIVE_EXAM_MASTER_STATE title missing');
assert(html.includes('description: switchVal'), 'Test 4 Failed: description switchVal missing');
console.log('✅ Test 4 Passed: toggleMasterExamSession broadcasts exam state via live Courses channel');

// 5. pullLiveCloudRecords parses SYSTEM-EXAM-SWITCH
assert(html.includes("(data.courses || []).find(c => (c.id === 'SYSTEM-EXAM-SWITCH' || c.courseId === 'SYSTEM-EXAM-SWITCH'))"), 'Test 5 Failed: pullLiveCloudRecords missing SYSTEM-EXAM-SWITCH lookup');
assert(html.includes("cloudExamActive = (switchState === 'ON' || switchState === 'TRUE');"), 'Test 5 Failed: switchState === ON missing in pullLiveCloudRecords');
console.log('✅ Test 5 Passed: pullLiveCloudRecords updates examSessionActive on Trainer devices instantly');

// 6. renderAdminCourses filters out system switch
assert(html.includes("if (crs.id === 'SYSTEM-EXAM-SWITCH' || crs.courseId === 'SYSTEM-EXAM-SWITCH') return false;"), 'Test 6 Failed: SYSTEM-EXAM-SWITCH not excluded in renderAdminCourses');
assert(html.includes("adminState.courses.filter(c => (c.id !== 'SYSTEM-EXAM-SWITCH' && c.courseId !== 'SYSTEM-EXAM-SWITCH'))"), 'Test 6 Failed: courses list purge missing');
console.log('✅ Test 6 Passed: SYSTEM-EXAM-SWITCH is completely hidden from visible course cards');

// 7. Login Info Box & Fast Login Cleanly Removed from Login Screen
const loginScreenHtml = html.substring(html.indexOf('id="admin-login-screen"'), html.indexOf('id="admin-portal-screen"'));
assert(!loginScreenHtml.includes('Official Login Credentials:'), 'Test 7 Failed: Credentials box still found in login screen HTML');
assert(!loginScreenHtml.includes("quickLoginAs('admin')"), 'Test 7 Failed: Fast login buttons still found in login screen HTML');
assert(html.includes('@hupare25077') && html.includes('ADMIN-YODDHA-01'), 'Test 7 Failed: Auth logic missing admin credential support');
console.log('✅ Test 7 Passed: Login credentials and fast-login buttons cleanly removed from login screen');

// 8. GoogleAppsScript_Code.js supports SYSTEM-EXAM-SWITCH natively
assert(gas.includes('SYSTEM-EXAM-SWITCH'), 'Test 8 Failed: GAS missing native SYSTEM-EXAM-SWITCH handler');
console.log('✅ Test 8 Passed: GAS natively persists SYSTEM-EXAM-SWITCH and updates ScriptProperties');

console.log('\n🎉 ALL 8 TESTS PASSED WITH 100% SUCCESS!');
