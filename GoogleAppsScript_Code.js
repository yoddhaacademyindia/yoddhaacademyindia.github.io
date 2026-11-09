/**
 * =========================================================================
 * 🥋 YODDHA ACADEMY INDIA - CENTRAL CLOUD SERVER & LIVE AUTH SCRIPT
 * =========================================================================
 * Features:
 * 1. Live Trainer Authentication (doGet):
 *    - Verifies Trainer ID & Password directly against Central Records!
 *    - Validates active status before granting access.
 * 2. Multi-Tab In-Place Sync (doPost):
 *    - 'Trainers' (13 Columns - in-place update by Trainer ID)
 *    - 'Students' (22 Columns - in-place update by Student ID)
 *    - 'Courses' (7 Columns - in-place update by Course ID)
 *    - 'Fee Structure' (6 Columns - auto updates schedule)
 *    - 'Competitions' (8 Columns - in-place update by Comp ID)
 * 3. Prevents duplicate rows on edits & updates.
 * =========================================================================
 */

// -------------------------------------------------------------------------
// 1. LIVE AUTHENTICATION & DATA RETRIEVAL (GET)
// -------------------------------------------------------------------------
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "verifyLogin";
    var callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;
    var result = {};

    // Action A: Verify Trainer Login credentials
    if (action === "verifyLogin") {
      var id = String((e && e.parameter && (e.parameter.id || e.parameter.trainerId)) || "").trim().toUpperCase();
      var pass = String((e && e.parameter && (e.parameter.pass || e.parameter.password)) || "").trim();

      var sheet = ss.getSheetByName("Trainers");
      if (!sheet) {
        result = { status: "error", authenticated: false, message: "Trainers section not found in Central Cloud Records." };
      } else {
        var data = sheet.getDataRange().getValues();
        var found = false;

        // Row 0 is header. Rows 1..N are trainers.
        // Col 1: Trainer ID, Col 2: Name, Col 3: Position, Col 4: Status, Col 5: Mobile, Col 6: WhatsApp, Col 7: Email, Col 8: State, Col 9: District, Col 10: Branch, Col 11: Address, Col 12: Password
        for (var i = 1; i < data.length; i++) {
          var rowId = String(data[i][1]).trim().toUpperCase();
          var rowPass = String(data[i][12]).trim();
          var rowStatus = String(data[i][4]).trim();

          if (rowId === id) {
            found = true;
            if (rowPass === pass) {
              if (rowStatus.toLowerCase() === "inactive" || rowStatus.toLowerCase() === "suspended") {
                result = {
                  status: "error",
                  authenticated: false,
                  message: "Your Trainer account is marked Inactive/Suspended. Please contact Central HQ."
                };
              } else {
                result = {
                  status: "success",
                  authenticated: true,
                  trainer: {
                    trainerId: String(data[i][1]).trim(),
                    fullName: String(data[i][2]).trim(),
                    position: String(data[i][3]).trim(),
                    status: rowStatus,
                    mobile: String(data[i][5]).trim(),
                    whatsapp: String(data[i][6]).trim(),
                    email: String(data[i][7]).trim(),
                    state: String(data[i][8]).trim(),
                    district: String(data[i][9]).trim(),
                    branch: String(data[i][10]).trim(),
                    address: String(data[i][11]).trim()
                  }
                };
              }
            } else {
              result = {
                status: "error",
                authenticated: false,
                message: "Incorrect password for Trainer " + id + ". Please verify with Central HQ."
              };
            }
            break;
          }
        }

        if (!found) {
          result = {
            status: "error",
            authenticated: false,
            message: "Trainer ID " + id + " was not found in Official Central Records."
          };
        }
      }
    } else {
      // Action B: Fetch all trainers
      var sheet = ss.getSheetByName("Trainers");
      var list = [];
      if (sheet) {
        var data = sheet.getDataRange().getValues();
        for (var i = 1; i < data.length; i++) {
          list.push({
            trainerId: String(data[i][1]).trim(),
            fullName: String(data[i][2]).trim(),
            status: String(data[i][4]).trim(),
            branch: String(data[i][10]).trim(),
            district: String(data[i][9]).trim(),
            state: String(data[i][8]).trim(),
            mobile: String(data[i][5]).trim(),
            password: String(data[i][12]).trim()
          });
        }
      }
      result = { status: "success", trainers: list };
    }

    var outputText = callback ? (callback + "(" + JSON.stringify(result) + ");") : JSON.stringify(result);
    var mime = callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON;
    return ContentService.createTextOutput(outputText).setMimeType(mime);

  } catch (err) {
    var errObj = { status: "error", authenticated: false, message: err.toString() };
    var outputText = callback ? (callback + "(" + JSON.stringify(errObj) + ");") : JSON.stringify(errObj);
    var mime = callback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON;
    return ContentService.createTextOutput(outputText).setMimeType(mime);
  }
}

// -------------------------------------------------------------------------
// 2. LIVE SYNC & IN-PLACE ROW UPDATES (POST)
// -------------------------------------------------------------------------
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var type = (data.type || "").toUpperCase();

    // 1. TRAINER REGISTRATION & IN-PLACE UPDATE (13 POINTS)
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
      if (!updated) sheet.appendRow(rowData);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: updated ? "Trainer updated in-place" : "Trainer registered",
        trainerId: trainerId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. STUDENT REGISTRATION & IN-PLACE UPDATE (32 POINTS)
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
      if (!updated) sheet.appendRow(rowData);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: updated ? "Student updated in-place" : "Student registered",
        studentId: studentId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 3. COURSE CREATION & UPDATE
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
      if (!updated) sheet.appendRow(rowData);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: updated ? "Course updated in-place" : "Course created",
        courseId: courseId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 4. FEE STRUCTURE UPDATE
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

    // 5. COMPETITION ANNOUNCEMENT & UPDATE
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
      if (!updated) sheet.appendRow(rowData);

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

// -------------------------------------------------------------------------
// 3. CENTRAL RECORD HELPERS
// -------------------------------------------------------------------------
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

function updateRowIfExists(sheet, idColIndex, idValue, newRowData) {
  if (!idValue) return false;
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return false;

  var idRange = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();
  for (var i = 0; i < idRange.length; i++) {
    if (String(idRange[i][0]).trim().toUpperCase() === String(idValue).trim().toUpperCase()) {
      var rowNumber = i + 2;
      sheet.getRange(rowNumber, 1, 1, newRowData.length).setValues([newRowData]);
      return true;
    }
  }
  return false;
}

// -------------------------------------------------------------------------
// 4. INSTANT INITIALIZATION TEST FUNCTION
// -------------------------------------------------------------------------
function testSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Create Trainers Record with test trainer
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

  // 2. Create Students Record with test student
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

  Logger.log("✅ Yoddha Academy India Cloud Records initialized successfully!");
}
