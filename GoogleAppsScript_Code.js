/**
 * =========================================================================
 * 🥋 YODDHA ACADEMY INDIA - GOOGLE SHEETS LIVE SYNC BACKEND SCRIPT
 * =========================================================================
 * Features:
 * 1. Multi-Tab Support: 'Trainers', 'Students', 'Courses', 'Fee Structure', 'Competitions'
 * 2. Automatic Header Creation with saffron/orange formatting
 * 3. In-Place Update: If Trainer ID, Student ID, Course ID, or Comp ID already exists,
 *    it updates the existing row in-place without creating duplicate rows!
 * 4. Automatic New Row Append for fresh submissions.
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Prevent concurrent write collisions

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var type = (data.type || "").toUpperCase();

    // ---------------------------------------------------------------------
    // 1. TRAINER REGISTRATION & IN-PLACE UPDATE (13 POINTS)
    // ---------------------------------------------------------------------
    if (type.indexOf("TRAINER") !== -1) {
      var sheet = getOrCreateSheet(ss, "Trainers", [
        "Timestamp", "Trainer ID", "Full Name", "Position", "Status",
        "Calling Mobile", "WhatsApp Mobile", "Official Email", "State",
        "District", "Akhada / Branch", "Full Address", "Login PIN / Password"
      ]);

      var trainerId = data.trainerId || data.id || "";
      var rowData = [
        new Date(),
        trainerId,
        data.fullName || data.name || "",
        data.position || "Branch Instructor",
        data.status || "Active",
        data.mobile || data.phone || "",
        data.whatsapp || data.mobile || data.phone || "",
        data.email || "",
        data.state || "",
        data.district || "",
        data.branch || "",
        data.address || "",
        data.password || data.pin || "1234"
      ];

      var updated = updateRowIfExists(sheet, 2, trainerId, rowData);
      if (!updated) {
        sheet.appendRow(rowData);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: updated ? "Trainer updated in-place" : "Trainer registered",
        trainerId: trainerId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ---------------------------------------------------------------------
    // 2. STUDENT REGISTRATION & IN-PLACE UPDATE (32 POINTS)
    // ---------------------------------------------------------------------
    if (type.indexOf("STUDENT") !== -1) {
      var sheet = getOrCreateSheet(ss, "Students", [
        "Timestamp", "Student ID", "Student Name", "Date of Birth", "Age",
        "Requested Level", "School Name", "Standard", "School Contact", "School Address",
        "Parent Name", "Parent Mobile", "City / Village", "District", "State",
        "Admission Date", "Trainer ID", "Trainer Name", "Status", "Fee Status",
        "Fee Amount", "UPI UTR Number"
      ]);

      var studentId = data.studentId || data.id || "";
      var rowData = [
        new Date(),
        studentId,
        data.studentName || data.name || "",
        data.dob || "",
        data.age || 0,
        data.requestedLevel || "Level 1",
        data.schoolName || "",
        data.standard || "",
        data.schoolContact || "",
        data.schoolAddress || "",
        data.parentName || "",
        data.parentMobile || "",
        data.city || "",
        data.district || "",
        data.state || "",
        data.admissionDate || "",
        data.trainerId || "",
        data.trainerName || "",
        data.status || "Active",
        data.feeStatus || "Paid",
        data.feeAmount || 500,
        data.utrNumber || ""
      ];

      var updated = updateRowIfExists(sheet, 2, studentId, rowData);
      if (!updated) {
        sheet.appendRow(rowData);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: updated ? "Student updated in-place" : "Student registered",
        studentId: studentId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ---------------------------------------------------------------------
    // 3. COURSE CREATION & UPDATE
    // ---------------------------------------------------------------------
    if (type.indexOf("COURSE") !== -1) {
      var sheet = getOrCreateSheet(ss, "Courses", [
        "Timestamp", "Course ID", "Course Name", "Duration", "Fee (INR)", "Levels", "Description"
      ]);

      var courseId = data.id || data.courseId || "";
      var rowData = [
        new Date(),
        courseId,
        data.name || "",
        data.duration || "",
        data.fee || 0,
        data.levels || "Level 1 to Senior 4",
        data.desc || ""
      ];

      var updated = updateRowIfExists(sheet, 2, courseId, rowData);
      if (!updated) {
        sheet.appendRow(rowData);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: updated ? "Course updated in-place" : "Course created",
        courseId: courseId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ---------------------------------------------------------------------
    // 4. FEE STRUCTURE UPDATE
    // ---------------------------------------------------------------------
    if (type.indexOf("FEE") !== -1) {
      var sheet = getOrCreateSheet(ss, "Fee Structure", [
        "Timestamp", "Admission Fee (INR)", "Monthly Training Fee (INR)",
        "Belt Exam Fee (INR)", "Tournament Fee (INR)", "Official UPI ID"
      ]);

      var rowData = [
        new Date(),
        data.admission || 500,
        data.monthly || 300,
        data.exam || 350,
        data.tournament || 400,
        data.upi || "yoddhaacademy5@okicici"
      ];

      if (sheet.getLastRow() >= 2) {
        sheet.getRange(2, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Fee Structure updated"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ---------------------------------------------------------------------
    // 5. COMPETITION ANNOUNCEMENT & UPDATE
    // ---------------------------------------------------------------------
    if (type.indexOf("COMPETITION") !== -1) {
      var sheet = getOrCreateSheet(ss, "Competitions", [
        "Timestamp", "Competition ID", "Title", "Date", "Location", "Entry Fee (INR)", "Categories", "Status"
      ]);

      var compId = data.id || data.compId || "";
      var rowData = [
        new Date(),
        compId,
        data.title || "",
        data.date || "",
        data.location || "",
        data.fee || 0,
        data.categories || "",
        data.status || "Registrations Open"
      ];

      var updated = updateRowIfExists(sheet, 2, compId, rowData);
      if (!updated) {
        sheet.appendRow(rowData);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: updated ? "Competition updated in-place" : "Competition created",
        compId: compId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", type: type }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Helper 1: Get sheet or create with formatted headers
function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#ea580c"); // Saffron / Kesari Header
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Helper 2: Find existing row by ID and update in-place
function updateRowIfExists(sheet, idColIndex, idValue, newRowData) {
  if (!idValue) return false;
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  var idRange = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();
  for (var i = 0; i < idRange.length; i++) {
    if (String(idRange[i][0]).trim().toUpperCase() === String(idValue).trim().toUpperCase()) {
      var rowNumber = i + 2; // +2 for 1-based index and header offset
      sheet.getRange(rowNumber, 1, 1, newRowData.length).setValues([newRowData]);
      return true;
    }
  }
  return false;
}

// =========================================================================
// 🚀 INSTANT TEST FUNCTION (Select 'testSetup' and click '▶ Run' in editor)
// =========================================================================
function testSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Create Trainers Sheet
  var trnSheet = getOrCreateSheet(ss, "Trainers", [
    "Timestamp", "Trainer ID", "Full Name", "Position", "Status",
    "Calling Mobile", "WhatsApp Mobile", "Official Email", "State",
    "District", "Akhada / Branch", "Full Address", "Login PIN / Password"
  ]);
  trnSheet.appendRow([
    new Date(), "YAI-TR-MH-KOP-001", "Ustad Sachin Patil", "Head Master & Founder", "Active",
    "9822012345", "9822012345", "sachin@yoddha.org", "Maharashtra (MH)",
    "Kolhapur", "Kolhapur Main Akhada", "Shivaji Stadium Chowk, Kolhapur", "1234"
  ]);

  // 2. Create Students Sheet
  var stuSheet = getOrCreateSheet(ss, "Students", [
    "Timestamp", "Student ID", "Student Name", "Date of Birth", "Age",
    "Requested Level", "School Name", "Standard", "School Contact", "School Address",
    "Parent Name", "Parent Mobile", "City / Village", "District", "State",
    "Admission Date", "Trainer ID", "Trainer Name", "Status", "Fee Status",
    "Fee Amount", "UPI UTR Number"
  ]);
  stuSheet.appendRow([
    new Date(), "YAI-STU-26-MH-KOP-000001", "Aarav Sachin Jadhav", "2012-05-14", 14,
    "Level 1 (Praveshika)", "Chhatrapati Shahu Vidyalaya", "8th Std", "9823000000", "Bhavani Mandap, Kolhapur",
    "Sachin Jadhav", "9822112233", "Kolhapur", "Kolhapur", "Maharashtra (MH)",
    "2026-06-01", "YAI-TR-MH-KOP-001", "Ustad Sachin Patil", "Active", "Paid",
    500, "UTR90823412998"
  ]);

  Logger.log("✅ Yoddha Academy India Database initialized successfully!");
}
