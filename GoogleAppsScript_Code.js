/**
 * =========================================================================
 * 🥋 YODDHA ACADEMY INDIA - CENTRAL CLOUD SERVER & LIVE AUTH SCRIPT (v3.0)
 * =========================================================================
 * Complete A-to-Z Central Cloud Storage & Real-Time Sync Engine for Martial Arts
 * 
 * 10 AUTOMATICALLY MANAGED CLOUD SHEETS:
 * 1. 'Students'             - 30-Point Complete Profile, Belt Ranks, Exam Marks & Level History
 * 2. 'ExamResults'          - Permanent Audit Log of all Live Belt Exams & Marks (AI + Trainer)
 * 3. 'LevelUpApplications'  - Log of all Belt Level-Up Applications, Fees, UTR & Approvals
 * 4. 'Trainers'             - 13-Point Certified Trainer Profiles & Secure Credentials
 * 5. 'Courses'              - Martial Arts Training Video Courses & Assigned Trainers
 * 6. 'Competitions'         - District, State & National Tournament Announcements
 * 7. 'TournamentEntries'    - Student Registrations for Tournaments & Entry Fees
 * 8. 'StudentSportsRecords' - Medals (Gold/Silver/Bronze) & Official Achievements Track Record
 * 9. 'Fee Structure'        - Level 1-6 & Senior 1-4 Official Belt Pricing + Academy UPI ID
 * 10. 'AcademySettings'     - Master Exam Live Camera Switch (ON/OFF) & System Settings
 * 
 * 100% FREE AUTOMATED EMAIL NOTIFICATIONS (MailApp):
 * - Welcome & Credentials Email to newly registered Trainers
 * - Admission Confirmation Email to Parents & Students with Student ID & Details
 * =========================================================================
 */

// 1. LIVE AUTHENTICATION & DATA RETRIEVAL ENDPOINT (GET)
// -------------------------------------------------------------------------
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || "";
  var id = (e && e.parameter && e.parameter.id) ? e.parameter.id.trim() : "";
  var pass = (e && e.parameter && e.parameter.pass) ? e.parameter.pass.trim() : "";

  var result = {
    status: "ready",
    server: "Yoddha Academy India Central Cloud Server",
    version: "3.0",
    timestamp: new Date().toISOString()
  };

  // 1A. Dual Login Verification (Admin or Certified Trainer)
  if (action === "verifyLogin") {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var customAdminPass = null;
    var setSheet = ss.getSheetByName("AcademySettings");
    if (setSheet) {
      var setRows = setSheet.getDataRange().getValues();
      for (var s = 1; s < setRows.length; s++) {
        var sk = String(setRows[s][0] || "").toUpperCase().trim();
        var sv = String(setRows[s][1] || "").trim();
        if (sk === "ADMIN_PASSWORD" || sk === "ADMIN_PIN" || sk === "MASTER_PASSWORD") {
          customAdminPass = sv;
        }
      }
    }

    // Check Admin Login (Default HQ Passwords or Custom Password from AcademySettings Sheet)
    var isAdminValid = (id.toUpperCase() === "ADMIN-YODDHA-01") && 
      (pass === "@hupare25077" || pass === "yoddha2026" || (customAdminPass && pass === customAdminPass));

    if (isAdminValid) {
      result = {
        status: "success",
        authenticated: true,
        role: "admin",
        userId: "ADMIN-YODDHA-01",
        userName: "Master Admin HQ",
        message: "Admin authentication successful"
      };
    } else {
      // Check Trainer Login against 'Trainers' sheet
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Trainers");

      if (!sheet) {
        result = { status: "error", authenticated: false, message: "Trainers section not found in Central Cloud Server" };
      } else {
        var data = sheet.getDataRange().getValues();
        var found = false;

        // Row 0 is header. Col index: 1 = Trainer ID, 2 = Full Name, 4 = Status, 12 = Login PIN/Password
        for (var i = 1; i < data.length; i++) {
          var row = data[i];
          var trnId = String(row[1] || "").trim();
          var trnPass = String(row[12] || "").trim();
          var trnStatus = String(row[4] || "").trim();
          var trnName = String(row[2] || "").trim();
          var trnPosition = String(row[3] || "").trim();
          var trnBranch = String(row[10] || "").trim();

          if (trnId.toLowerCase() === id.toLowerCase()) {
            if (trnPass === pass) {
              if (trnStatus.toLowerCase() === "inactive") {
                result = { status: "error", authenticated: false, message: "Your Trainer Account is currently Inactive. Please contact Central HQ." };
              } else {
                result = {
                  status: "success",
                  authenticated: true,
                  role: "trainer",
                  userId: trnId,
                  userName: trnName,
                  position: trnPosition,
                  branch: trnBranch,
                  message: "Trainer authentication successful"
                };
              }
            } else {
              result = { status: "error", authenticated: false, message: "Incorrect Password! Please enter valid credentials." };
            }
            found = true;
            break;
          }
        }

        if (!found) {
          result = { status: "error", authenticated: false, message: "Unique ID not found in Central Cloud Server" };
        }
      }
    }
  }

  // 1B. Read All A-to-Z Academy Sections for Live Synchronization
  if (action === "readAll" || action === "syncAll") {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var allData = {
      status: "success",
      server: "Yoddha Academy India Central Cloud Server",
      timestamp: new Date().toISOString(),
      trainers: [],
      students: [],
      courses: [],
      competitions: [],
      studentCompetitions: {},
      feeStructure: {},
      examSessionActive: true
    };

    // 1. Read Trainers from Sheet
    var trnSheet = ss.getSheetByName("Trainers");
    if (trnSheet) {
      var trnRows = trnSheet.getDataRange().getValues();
      for (var i = 1; i < trnRows.length; i++) {
        var tr = trnRows[i];
        if (tr[1]) {
          allData.trainers.push({
            trainerId: String(tr[1]).trim(),
            id: String(tr[1]).trim(),
            fullName: String(tr[2] || "").trim(),
            name: String(tr[2] || "").trim(),
            position: String(tr[3] || "Instructor").trim(),
            status: String(tr[4] || "Active").trim(),
            mobile: String(tr[5] || "").trim(),
            phone: String(tr[5] || "").trim(),
            whatsapp: String(tr[6] || tr[5] || "").trim(),
            email: String(tr[7] || "").trim(),
            state: String(tr[8] || "Maharashtra").trim(),
            district: String(tr[9] || "Kolhapur").trim(),
            branch: String(tr[10] || "").trim(),
            address: String(tr[11] || "").trim(),
            password: String(tr[12] || "").trim(),
            pin: String(tr[12] || "").trim()
          });
        }
      }
    }

    // 2. Read Students from Sheet (with complete 30-point columns)
    var stuSheet = ss.getSheetByName("Students");
    if (stuSheet) {
      var stuRows = stuSheet.getDataRange().getValues();
      for (var j = 1; j < stuRows.length; j++) {
        var sr = stuRows[j];
        if (sr[1]) {
          var stuObj = {
            studentId: String(sr[1]).trim(),
            id: String(sr[1]).trim(),
            studentName: String(sr[2] || "").trim(),
            name: String(sr[2] || "").trim(),
            dob: String(sr[3] || "").trim(),
            age: Number(sr[4]) || 0,
            requestedLevel: String(sr[5] || "Level 1").trim(),
            schoolName: String(sr[6] || "").trim(),
            standard: String(sr[7] || "").trim(),
            schoolContact: String(sr[8] || "").trim(),
            schoolAddress: String(sr[9] || "").trim(),
            parentName: String(sr[10] || "").trim(),
            parentMobile: String(sr[11] || "").trim(),
            city: String(sr[12] || "").trim(),
            district: String(sr[13] || "").trim(),
            state: String(sr[14] || "").trim(),
            admissionDate: String(sr[15] || "").trim(),
            trainerId: String(sr[16] || "").trim(),
            trainerName: String(sr[17] || "").trim(),
            status: String(sr[18] || "Active").trim(),
            feeStatus: String(sr[19] || "Paid").trim(),
            feeAmount: Number(sr[20]) || 500,
            utrNumber: String(sr[21] || "").trim(),
            examStatus: String(sr[22] || "TRAINING").trim(),
            aiScore: Number(sr[23]) || null,
            trainerScore: Number(sr[24]) || null,
            totalScore: Number(sr[25]) || null,
            examDate: String(sr[26] || "").trim(),
            levelUpPending: String(sr[27] || "").toUpperCase() === "YES" || sr[27] === true,
            pendingNextLevel: String(sr[28] || "").trim(),
            levelHistoryStr: String(sr[29] || "").trim()
          };

          if (stuObj.aiScore || stuObj.totalScore) {
            stuObj.lastExam = {
              aiScore: stuObj.aiScore,
              trainerScore: stuObj.trainerScore,
              totalScore: stuObj.totalScore,
              examDate: stuObj.examDate
            };
          }

          allData.students.push(stuObj);
        }
      }
    }

    // 3. Read Level-wise Fee Structure from Sheet
    var feeSheet = ss.getSheetByName("Fee Structure");
    if (feeSheet) {
      var feeRows = feeSheet.getDataRange().getValues();
      var feeMap = {};
      for (var k = 1; k < feeRows.length; k++) {
        var fr = feeRows[k];
        var param = String(fr[0] || "").toLowerCase().trim();
        var val = fr[1];
        if (param === "level 1") feeMap.level1 = Number(val) || 500;
        else if (param === "level 2") feeMap.level2 = Number(val) || 600;
        else if (param === "level 3") feeMap.level3 = Number(val) || 700;
        else if (param === "level 4") feeMap.level4 = Number(val) || 800;
        else if (param === "level 5") feeMap.level5 = Number(val) || 900;
        else if (param === "level 6") feeMap.level6 = Number(val) || 1000;
        else if (param === "senior 1") feeMap.senior1 = Number(val) || 1200;
        else if (param === "senior 2") feeMap.senior2 = Number(val) || 1400;
        else if (param === "senior 3") feeMap.senior3 = Number(val) || 1600;
        else if (param === "senior 4") feeMap.senior4 = Number(val) || 1800;
        else if (param.indexOf("upi") !== -1) feeMap.upi = String(val).trim();
      }
      allData.feeStructure = feeMap;
    }

    // 4. Read Courses from Sheet
    var crsSheet = ss.getSheetByName("Courses");
    if (crsSheet) {
      var crsRows = crsSheet.getDataRange().getValues();
      allData.courses = [];
      for (var m = 1; m < crsRows.length; m++) {
        var cr = crsRows[m];
        if (cr[1]) {
          var tStr = String(cr[6] || "ALL").trim();
          var tArr = tStr.split(",").map(function(s){ return s.trim(); }).filter(Boolean);
          allData.courses.push({
            id: String(cr[1]).trim(),
            name: String(cr[2] || "").trim(),
            title: String(cr[2] || "").trim(),
            desc: String(cr[3] || "").trim(),
            description: String(cr[3] || "").trim(),
            youtubeUrl: String(cr[4] || "").trim(),
            videoUrl: String(cr[4] || "").trim(),
            thumbnail: String(cr[5] || "").trim(),
            assignedTrainers: tArr.length > 0 ? tArr : ["ALL"]
          });
        }
      }
    }

    // 5. Read Competitions from Sheet
    var compSheet = ss.getSheetByName("Competitions");
    if (compSheet) {
      var compRows = compSheet.getDataRange().getValues();
      allData.competitions = [];
      for (var c = 1; c < compRows.length; c++) {
        var cm = compRows[c];
        if (cm[1]) {
          allData.competitions.push({
            id: String(cm[1]).trim(),
            level: String(cm[2] || "State Level").trim(),
            title: String(cm[3] || "").trim(),
            date: String(cm[4] || "").trim(),
            location: String(cm[5] || "").trim(),
            categories: String(cm[6] || "").trim(),
            fee: Number(cm[7]) || 300,
            status: String(cm[8] || "Registrations Open").trim(),
            scope: String(cm[9] || "All").trim()
          });
        }
      }
    }

    // 6. Read Student Sports Records & Medals from Sheet
    var recSheet = ss.getSheetByName("StudentSportsRecords");
    if (recSheet) {
      var recRows = recSheet.getDataRange().getValues();
      for (var r = 1; r < recRows.length; r++) {
        var row = recRows[r];
        var sId = String(row[1] || "").trim();
        if (sId) {
          if (!allData.studentCompetitions[sId]) allData.studentCompetitions[sId] = [];
          allData.studentCompetitions[sId].push({
            title: String(row[3] || "").trim(),
            date: String(row[4] || "").trim(),
            category: String(row[5] || "").trim(),
            achievement: String(row[6] || "").trim(),
            certificate: String(row[7] || "").trim()
          });
        }
      }
    }

    // 7. Read Master Exam Switch & Custom Admin Password from AcademySettings Sheet
    var setSheet = ss.getSheetByName("AcademySettings");
    if (setSheet) {
      var setRows = setSheet.getDataRange().getValues();
      for (var s = 1; s < setRows.length; s++) {
        var sk = String(setRows[s][0] || "").toUpperCase().trim();
        var rawVal = String(setRows[s][1] || "").trim();
        var sv = rawVal.toUpperCase();
        if (sk === "EXAM_MASTER_SWITCH") {
          allData.examSessionActive = (sv === "ON" || sv === "TRUE");
        }
        if (sk === "ADMIN_PASSWORD" || sk === "ADMIN_PIN" || sk === "MASTER_PASSWORD") {
          allData.adminPass = rawVal;
        }
      }
    }

    return ContentService.createTextOutput(JSON.stringify(allData))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 1C. Read Single Sheet (Fallback)
  if (action === "readSheet") {
    var sheetName = (e && e.parameter && e.parameter.sheet) || "Trainers";
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      result = { status: "error", message: "Section not found: " + sheetName };
    } else {
      var data = sheet.getDataRange().getValues();
      result = { status: "success", sheet: sheetName, rows: data };
    }
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// 2. LIVE SYNC & IN-PLACE ROW UPDATES + AUTOMATED EMAILS (POST)
// -------------------------------------------------------------------------
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var type = (data.type || data.action || "").toUpperCase();

    // -----------------------------------------------------------------------
    // 1. TRAINER REGISTRATION & IN-PLACE UPDATE (13 POINTS) + WELCOME EMAIL
    // -----------------------------------------------------------------------
    if (type.indexOf("TRAINER") !== -1) {
      var sheet = getOrCreateSheet(ss, "Trainers", [
        "Timestamp", "Trainer ID", "Full Name", "Position", "Status",
        "Calling Mobile", "WhatsApp Mobile", "Official Email", "State",
        "District", "Akhada / Branch", "Full Address", "Login PIN / Password"
      ]);

      var trainerId = data.trainerId || data.id || "";
      var trainerPass = data.password || data.pin || "1234";
      var trainerEmail = (data.email || "").trim();
      var trainerName = data.fullName || data.name || "Certified Trainer";

      var rowData = [
        new Date(),
        trainerId,
        trainerName,
        data.position || "Branch Instructor",
        data.status || "Active",
        data.mobile || data.phone || "",
        data.whatsapp || data.mobile || data.phone || "",
        trainerEmail,
        data.state || "",
        data.district || "",
        data.branch || "",
        data.address || "",
        trainerPass
      ];

      var updated = updateRowIfExistsOrMerge(sheet, 2, trainerId, rowData);
      if (!updated) sheet.appendRow(rowData);

      // Send 100% FREE Welcome & Credentials Email to Trainer via MailApp
      var emailSent = false;
      if (trainerEmail && data.sendWelcomeEmail !== false) {
        try {
          sendTrainerWelcomeEmail(trainerEmail, trainerName, trainerId, trainerPass, data.position, data.branch || data.district);
          emailSent = true;
        } catch(mailErr) {
          Logger.log("Trainer Mail send failed: " + mailErr.toString());
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: updated ? "Trainer updated in-place" : "Trainer registered successfully",
        trainerId: trainerId,
        welcomeEmailSent: emailSent
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -----------------------------------------------------------------------
    // 2. STUDENT REGISTRATION, EXAM MARKS & LEVEL PROGRESSION (30 POINTS)
    // -----------------------------------------------------------------------
    if (type.indexOf("STUDENT") !== -1) {
      var sheet = getOrCreateSheet(ss, "Students", [
        "Timestamp", "Student ID", "Student Name", "Date of Birth", "Age",
        "Requested Level", "School Name", "Standard", "School Contact", "School Address",
        "Parent Name", "Parent Mobile", "City / Village", "District", "State",
        "Admission Date", "Trainer ID", "Trainer Name", "Status", "Fee Status",
        "Fee Amount", "UPI UTR Number", "Live Exam Status", "Live AI Camera Score (/50)",
        "Trainer Exam Score (/50)", "Grand Total Score (/100)", "Exam Passed Date",
        "Level Up Pending", "Pending Next Level", "10-Level History & Passed Marks"
      ]);

      var studentId = data.studentId || data.id || "";
      var studentName = data.studentName || data.name || "Student";
      var parentEmail = (data.parentEmail || data.email || "").trim();

      // Extract exam scores if present
      var aiScore = (data.lastExam && data.lastExam.aiScore) ? data.lastExam.aiScore : (data.aiScore || "");
      var trScore = (data.lastExam && data.lastExam.trainerScore) ? data.lastExam.trainerScore : (data.trainerScore || "");
      var totScore = (data.lastExam && data.lastExam.totalScore) ? data.lastExam.totalScore : (data.totalScore || "");
      var exDate = (data.lastExam && data.lastExam.examDate) ? data.lastExam.examDate : (data.examDate || "");
      var lvlHistStr = data.levelHistory ? JSON.stringify(data.levelHistory) : (data.levelHistoryStr || "");

      var rowData = [
        new Date(),
        studentId,
        studentName,
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
        data.utrNumber || "",
        data.examStatus || "TRAINING",
        aiScore,
        trScore,
        totScore,
        exDate,
        data.levelUpPending ? "YES" : "NO",
        data.pendingNextLevel || "",
        lvlHistStr
      ];

      var updated = updateRowIfExistsOrMerge(sheet, 2, studentId, rowData);
      if (!updated) sheet.appendRow(rowData);

      // Log Belt Exam Result to dedicated 'ExamResults' sheet
      if (data.action === "updateExamResults" || (data.lastExam && data.lastExam.totalScore)) {
        try {
          var examSheet = getOrCreateSheet(ss, "ExamResults", [
            "Timestamp", "Exam Reference ID", "Student ID", "Student Name", "Akhada / Branch",
            "District", "State", "Belt Level", "AI Camera Score (/50)", "Trainer Score (/50)",
            "Grand Total (/100)", "Grade", "Exam Date", "Trainer / Ustad Name", "Status"
          ]);
          var examRefId = "EXAM-" + studentId.replace(/[^A-Za-z0-9]/g, "") + "-L" + (data.lastExam?.levelNum || 1);
          examSheet.appendRow([
            new Date(),
            examRefId,
            studentId,
            studentName,
            data.city ? data.city + " Akhada" : "Central Akhada",
            data.district || "",
            data.state || "Maharashtra",
            data.lastExam?.levelName || data.requestedLevel || "Level 1",
            aiScore,
            trScore,
            totScore,
            totScore >= 90 ? "A+" : (totScore >= 80 ? "A" : "B+"),
            exDate || new Date().toLocaleDateString("en-IN"),
            data.lastExam?.trainerName || data.trainerName || "Certified Ustad",
            "PASSED & CERTIFIED"
          ]);
        } catch(examErr) {
          Logger.log("ExamResults log error: " + examErr.toString());
        }
      }

      // Log Level-Up Application to dedicated 'LevelUpApplications' sheet
      if (data.action === "submitLevelUp" || data.action === "approveLevelUp") {
        try {
          var lvlAppSheet = getOrCreateSheet(ss, "LevelUpApplications", [
            "Timestamp", "Student ID", "Student Name", "Promoted From Level", "Promoted To Level",
            "Fee Amount (₹)", "UPI UTR Number", "Application Status", "Approval Date"
          ]);
          lvlAppSheet.appendRow([
            new Date(),
            studentId,
            studentName,
            data.oldLevel || data.requestedLevel || "",
            data.pendingNextLevel || data.nextLvlName || "",
            data.feeAmount || 600,
            data.utrNumber || "",
            data.action === "approveLevelUp" ? "APPROVED & PAID" : "PENDING VERIFICATION",
            data.action === "approveLevelUp" ? new Date().toLocaleDateString("en-IN") : "-"
          ]);
        } catch(lvlErr) {
          Logger.log("LevelUpApplications log error: " + lvlErr.toString());
        }
      }

      // Send Admission Confirmation Email if parent email is provided
      var studentEmailSent = false;
      if (parentEmail && data.sendAdmissionEmail !== false && !data.action) {
        try {
          sendStudentAdmissionEmail(parentEmail, studentName, studentId, data.requestedLevel, data.trainerName, data.feeAmount, data.utrNumber);
          studentEmailSent = true;
        } catch(mailErr) {
          Logger.log("Student Mail send failed: " + mailErr.toString());
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: updated ? "Student updated in-place" : "Student registered successfully",
        studentId: studentId,
        admissionEmailSent: studentEmailSent
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -----------------------------------------------------------------------
    // 3. STUDENT SPORTS RECORDS & MEDALS (Gold/Silver/Bronze Track Record)
    // -----------------------------------------------------------------------
    if (type.indexOf("STUDENT_COMPETITION_RECORD") !== -1 || type.indexOf("SPORTS_RECORD") !== -1) {
      var sheet = getOrCreateSheet(ss, "StudentSportsRecords", [
        "Timestamp", "Student ID", "Student Name", "Tournament Title", "Event Date",
        "Discipline / Category", "Medal / Achievement", "Certificate Number"
      ]);

      sheet.appendRow([
        new Date(),
        data.studentId || "",
        data.studentName || "",
        data.title || "",
        data.date || new Date().toISOString().split("T")[0],
        data.category || "Martial Arts Sparring",
        data.achievement || "🥇 Gold Medal",
        data.certificate || ("YAI-COMP-" + Date.now().toString().slice(-6))
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Student competition medal record saved permanently",
        studentId: data.studentId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -----------------------------------------------------------------------
    // 4. COURSES IN-PLACE UPDATE (TITLE, DESC, VIDEO LINK, THUMBNAIL, ASSIGNED)
    // -----------------------------------------------------------------------
    // -----------------------------------------------------------------------
    // 4B. COURSE DELETION
    // -----------------------------------------------------------------------
    if (type === "COURSE_DELETE" || type === "DELETE_COURSE") {
      var sheet = ss.getSheetByName("Courses");
      if (sheet) {
        var targetId = String(data.id || data.courseId || "").trim().toLowerCase();
        var rows = sheet.getDataRange().getValues();
        for (var r = 1; r < rows.length; r++) {
          if (String(rows[r][1]).trim().toLowerCase() === targetId) {
            sheet.deleteRow(r + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Course deleted from cloud"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (type.indexOf("COURSE") !== -1) {
      var sheet = getOrCreateSheet(ss, "Courses", [
        "Timestamp", "Course ID", "Course Title", "Description", "Video Link", "Thumbnail URL", "Assigned Trainers"
      ]);

      var courseId = data.id || data.courseId || "";
      var trainersStr = Array.isArray(data.assignedTrainers) ? data.assignedTrainers.join(", ") : (data.assignedTrainers || "ALL");
      var rowData = [
        new Date(),
        courseId,
        data.title || data.name || "",
        data.description || data.desc || "",
        data.youtubeUrl || data.videoUrl || "",
        data.thumbnail || "",
        trainersStr
      ];

      var updated = updateRowIfExistsOrMerge(sheet, 2, courseId, rowData);
      if (!updated) sheet.appendRow(rowData);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: updated ? "Course updated in-place" : "Course registered",
        courseId: courseId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -----------------------------------------------------------------------
    // 5. COMPETITIONS IN-PLACE UPDATE
    // -----------------------------------------------------------------------
    if (type.indexOf("COMPETITION") !== -1 && type.indexOf("RECORD") === -1) {
      var sheet = getOrCreateSheet(ss, "Competitions", [
        "Timestamp", "Competition ID", "Championship Level", "Title", "Date", "Location", "Categories", "Entry Fee", "Status", "Eligible Scope"
      ]);

      var compId = data.id || data.compId || "";
      var rowData = [
        new Date(),
        compId,
        data.level || "State Level",
        data.title || "",
        data.date || "",
        data.location || "",
        data.categories || "",
        data.fee || 300,
        data.status || "Registrations Open",
        data.scope || "All Branches"
      ];

      var updated = updateRowIfExistsOrMerge(sheet, 2, compId, rowData);
      if (!updated) sheet.appendRow(rowData);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: updated ? "Competition updated in-place" : "Competition created",
        compId: compId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -----------------------------------------------------------------------
    // 6. TOURNAMENT STUDENT REGISTRATIONS
    // -----------------------------------------------------------------------
    if (type.indexOf("TOURNAMENT") !== -1) {
      var sheet = getOrCreateSheet(ss, "TournamentEntries", [
        "Timestamp", "Competition ID", "Tournament Title", "Championship Level",
        "Student ID", "Student Name", "Event Discipline", "Age / Weight Division",
        "Fee Status", "Fee Amount (Rs)", "Trainer Name"
      ]);

      sheet.appendRow([
        new Date(),
        data.compId || "",
        data.compTitle || "",
        data.compLevel || "State Level",
        data.studentId || "",
        data.studentName || "",
        data.discipline || "",
        data.division || "",
        data.feeStatus || "Paid",
        data.feeAmount || 300,
        data.trainerName || ""
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Tournament athlete entry recorded",
        studentId: data.studentId,
        compId: data.compId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -----------------------------------------------------------------------
    // 7. LEVEL-WISE FEE STRUCTURE IN-PLACE UPDATE (LEVEL 1-6 & SENIOR 1-4 + UPI)
    // -----------------------------------------------------------------------
    if (type.indexOf("FEE") !== -1) {
      var sheet = getOrCreateSheet(ss, "Fee Structure", [
        "Level / Parameter", "Fee Amount (₹)", "Last Updated"
      ]);

      var feeItems = [
        ["Level 1", Number(data.level1) || 500, new Date()],
        ["Level 2", Number(data.level2) || 600, new Date()],
        ["Level 3", Number(data.level3) || 700, new Date()],
        ["Level 4", Number(data.level4) || 800, new Date()],
        ["Level 5", Number(data.level5) || 900, new Date()],
        ["Level 6", Number(data.level6) || 1000, new Date()],
        ["Senior 1", Number(data.senior1) || 1200, new Date()],
        ["Senior 2", Number(data.senior2) || 1400, new Date()],
        ["Senior 3", Number(data.senior3) || 1600, new Date()],
        ["Senior 4", Number(data.senior4) || 1800, new Date()],
        ["Official Academy UPI ID / Number", String(data.upi || "yoddhaacademy@upi"), new Date()]
      ];

      sheet.clearContents();
      sheet.appendRow(["Level / Parameter", "Fee Amount (₹)", "Last Updated"]);
      feeItems.forEach(function(item) {
        sheet.appendRow(item);
      });

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Level-wise Fee structure updated in-place"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // -----------------------------------------------------------------------
    // 8. MASTER EXAM SWITCH & ACADEMY SETTINGS
    // -----------------------------------------------------------------------
    if (type.indexOf("EXAM_SESSION_TOGGLED") !== -1 || type.indexOf("SETTING") !== -1) {
      var sheet = getOrCreateSheet(ss, "AcademySettings", [
        "Setting Key", "Setting Value", "Updated By", "Last Updated"
      ]);

      var settingVal = data.examSessionActive ? "ON" : "OFF";
      var rowData = ["EXAM_MASTER_SWITCH", settingVal, data.toggledBy || "Admin", new Date()];
      var updated = updateRowIfExistsOrMerge(sheet, 1, "EXAM_MASTER_SWITCH", rowData);
      if (!updated) sheet.appendRow(rowData);

      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Master exam switch updated to " + settingVal
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Unrecognized action type: " + type
    })).setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// -------------------------------------------------------------------------
// 3. AUTOMATED HTML EMAIL GENERATORS (100% FREE VIA MAILAPP)
// -------------------------------------------------------------------------

/**
 * Sends official congratulations and credentials email to newly registered Trainer
 */
function sendTrainerWelcomeEmail(toEmail, trainerName, trainerId, trainerPass, position, branch) {
  var subject = "🥋 Congratulations & Welcome to Yoddha Academy India - Official Certified Trainer Credentials";
  
  var htmlBody = '<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 2px solid #ea580c; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">'
    + '<div style="background: linear-gradient(135deg, #ea580c, #f59e0b); color: #ffffff; padding: 25px 20px; text-align: center;">'
    + '<h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">YODDHA ACADEMY INDIA</h1>'
    + '<p style="margin: 6px 0 0; font-size: 13px; color: #fef08a; font-weight: bold; letter-spacing: 2px;">ALL INDIA MARTIAL ARTS & SPORTS TRAINING ACADEMY</p>'
    + '</div>'
    + '<div style="padding: 25px 25px 20px; color: #1e293b; line-height: 1.6;">'
    + '<h2 style="color: #ea580c; margin-top: 0; font-size: 20px;">🥋 हार्दिक अभिनंदन व सहर्ष स्वागत!</h2>'
    + '<p style="font-size: 14px; margin-bottom: 12px;">सस्नेह नमस्कार <strong>' + trainerName + '</strong> सर,</p>'
    + '<p style="font-size: 14px; margin-bottom: 15px;">योध्या अकॅडमी इंडिया परिवारात आपले अधिकृत <strong>' + (position || "Certified Trainer") + '</strong> म्हणून नियुक्ती झाल्याबद्दल आपले मनःपूर्वक अभिनंदन!</p>'
    + '<div style="background: #fff7ed; padding: 14px 16px; border-left: 4px solid #ea580c; border-radius: 6px; font-size: 13px; color: #9a3412; margin-bottom: 20px;">'
    + 'भारतीय पारंपरिक मार्शल आर्ट्स (लाठी-काठी, तलवारबाजी, कराटे व स्वसंरक्षण) या पवित्र विद्येचा प्रचार-प्रसार करण्यासाठी, तरुण पिढीला सुदृढ व शिस्तबद्ध बनवण्यासाठी आपल्या भावी वाटचालीस व कार्यासाठी <strong>योध्या अकॅडमी इंडिया</strong> कडून लाख लाख शुभेच्छा! 🚩'
    + '</div>'
    + '<div style="background: #f8fafc; border: 2px dashed #ea580c; border-radius: 14px; padding: 18px 20px; margin: 20px 0;">'
    + '<h3 style="margin: 0 0 12px; color: #0f172a; font-size: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">🔐 आपले अधिकृत लॉगिन क्रेडेंशियल्स (Official Login Details):</h3>'
    + '<table style="width: 100%; font-size: 14px;">'
    + '<tr><td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Trainer ID:</strong></td><td style="padding: 6px 0; color: #ea580c; font-weight: bold; font-family: monospace; font-size: 16px;">' + trainerId + '</td></tr>'
    + '<tr><td style="padding: 6px 0; color: #64748b;"><strong>Password / PIN:</strong></td><td style="padding: 6px 0; color: #0f172a; font-weight: bold; font-family: monospace; font-size: 16px; background: #fed7aa; padding: 3px 8px; border-radius: 6px; display: inline-block;">' + trainerPass + '</td></tr>'
    + '<tr><td style="padding: 6px 0; color: #64748b;"><strong>Designation:</strong></td><td style="padding: 6px 0; color: #334155; font-weight: 600;">' + (position || "Branch Instructor") + '</td></tr>'
    + '<tr><td style="padding: 6px 0; color: #64748b;"><strong>Akhada / Branch:</strong></td><td style="padding: 6px 0; color: #334155; font-weight: 600;">' + (branch || "Central HQ") + '</td></tr>'
    + '</table>'
    + '</div>'
    + '<div style="text-align: center; margin: 25px 0;">'
    + '<a href="https://yoddhaacademyindia.github.io/" target="_blank" style="background: linear-gradient(135deg, #ea580c, #f59e0b); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 10px rgba(234, 88, 12, 0.35);">'
    + '🚀 ओपन ट्रेनर लॉगिन पॅनेल (Open Trainer Panel)'
    + '</a>'
    + '</div>'
    + '<p style="font-size: 12px; color: #64748b; margin-top: 15px;">⚠️ <em>सुरक्षितता सूचना: हा ईमेल आणि पासवर्ड गोपनीय ठेवा. लॉगिन पोर्टलवर जाऊन आपण आपला पासवर्ड कधीही बदलू शकता.</em></p>'
    + '</div>'
    + '<div style="background: #0f172a; color: #94a3b8; padding: 15px 20px; text-align: center; font-size: 11px;">'
    + '<p style="margin: 0; color: #f8fafc; font-weight: bold;">योध्या अकॅडमी इंडिया • केंद्रीय मुख्यालय</p>'
    + '<p style="margin: 4px 0 0;">अधिकृत पोर्टल: <a href="https://yoddhaacademyindia.github.io/" style="color: #fb923c; text-decoration: none;">yoddhaacademyindia.github.io</a></p>'
    + '<p style="margin: 4px 0 0;">Traditional Martial Arts & Sports Training • All India Organization</p>'
    + '</div>'
    + '</div>';

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    htmlBody: htmlBody
  });
}

/**
 * Sends official admission confirmation email to Student / Parent
 */
function sendStudentAdmissionEmail(toEmail, studentName, studentId, level, trainerName, feeAmount, utrNumber) {
  var subject = "🥋 Welcome to Yoddha Academy India - Student Admission Confirmed (" + studentId + ")";
  
  var htmlBody = '<div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 2px solid #ea580c; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">'
    + '<div style="background: linear-gradient(135deg, #ea580c, #f59e0b); color: #ffffff; padding: 25px 20px; text-align: center;">'
    + '<h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">YODDHA ACADEMY INDIA</h1>'
    + '<p style="margin: 6px 0 0; font-size: 13px; color: #fef08a; font-weight: bold; letter-spacing: 2px;">OFFICIAL STUDENT ADMISSION CONFIRMATION</p>'
    + '</div>'
    + '<div style="padding: 25px 25px 20px; color: #1e293b; line-height: 1.6;">'
    + '<h2 style="color: #ea580c; margin-top: 0; font-size: 20px;">🎉 प्रवेश निश्चित झाला आहे! (Admission Confirmed)</h2>'
    + '<p style="font-size: 14px;">प्रिय पालक व <strong>' + studentName + '</strong>,<br><br>योध्या अकॅडमी इंडियामध्ये आपले अधिकृत ॲडमिशन यशस्वीरित्या पूर्ण झाले आहे. पारंपरिक युद्धकला आणि क्रीडा कौशल्यांमध्ये आपले सहर्ष स्वागत!</p>'
    + '<div style="background: #f8fafc; border: 2px dashed #ea580c; border-radius: 14px; padding: 18px 20px; margin: 20px 0;">'
    + '<table style="width: 100%; font-size: 14px;">'
    + '<tr><td style="padding: 6px 0; color: #64748b; width: 140px;"><strong>Student Name:</strong></td><td style="padding: 6px 0; color: #0f172a; font-weight: bold;">' + studentName + '</td></tr>'
    + '<tr><td style="padding: 6px 0; color: #64748b;"><strong>Student ID:</strong></td><td style="padding: 6px 0; color: #ea580c; font-weight: bold; font-family: monospace; font-size: 16px;">' + studentId + '</td></tr>'
    + '<tr><td style="padding: 6px 0; color: #64748b;"><strong>10-Star Belt Level:</strong></td><td style="padding: 6px 0; color: #334155; font-weight: bold;">' + (level || "Level 1") + '</td></tr>'
    + '<tr><td style="padding: 6px 0; color: #64748b;"><strong>Assigned Trainer:</strong></td><td style="padding: 6px 0; color: #334155; font-weight: 600;">' + (trainerName || "Central Certified Coach") + '</td></tr>'
    + '<tr><td style="padding: 6px 0; color: #64748b;"><strong>Fee Paid:</strong></td><td style="padding: 6px 0; color: #166534; font-weight: bold;">₹' + (feeAmount || 500) + ' (UTR: ' + (utrNumber || "Verified") + ')</td></tr>'
    + '</table>'
    + '</div>'
    + '<div style="text-align: center; margin: 25px 0;">'
    + '<a href="https://yoddhaacademyindia.github.io/" target="_blank" style="background: linear-gradient(135deg, #ea580c, #f59e0b); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px; display: inline-block;">'
    + '🪪 व्ह्यू डिजिटल आयडी कार्ड (View Digital ID Card)'
    + '</a>'
    + '</div>'
    + '</div>'
    + '<div style="background: #0f172a; color: #94a3b8; padding: 15px 20px; text-align: center; font-size: 11px;">'
    + '<p style="margin: 0; color: #f8fafc; font-weight: bold;">योध्या अकॅडमी इंडिया • केंद्रीय मुख्यालय</p>'
    + '<p style="margin: 4px 0 0;">अधिकृत पोर्टल: <a href="https://yoddhaacademyindia.github.io/" style="color: #fb923c; text-decoration: none;">yoddhaacademyindia.github.io</a></p>'
    + '</div>'
    + '</div>';

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    htmlBody: htmlBody
  });
}

// -------------------------------------------------------------------------
// 4. HELPER FUNCTIONS FOR IN-PLACE ROW UPDATES & AUTO SHEET CREATION
// -------------------------------------------------------------------------

/**
 * Searches column (1-based index) for matchVal. If found, updates that entire row,
 * intelligently merging non-empty new values without overwriting existing data.
 */
function updateRowIfExistsOrMerge(sheet, colIndex, matchVal, newRowData) {
  if (!matchVal) return false;
  var data = sheet.getDataRange().getValues();
  var matchStr = String(matchVal).trim().toLowerCase();

  for (var i = 1; i < data.length; i++) {
    var cellStr = String(data[i][colIndex - 1] || "").trim().toLowerCase();
    if (cellStr === matchStr) {
      var existingRow = data[i];
      var mergedRow = [];
      for (var c = 0; c < newRowData.length; c++) {
        var newVal = newRowData[c];
        // If newVal is undefined, null, or empty string, keep existing value
        if ((newVal === undefined || newVal === null || newVal === "") && existingRow[c] !== undefined && existingRow[c] !== "") {
          mergedRow.push(existingRow[c]);
        } else {
          mergedRow.push(newVal !== undefined && newVal !== null ? newVal : "");
        }
      }
      sheet.getRange(i + 1, 1, 1, mergedRow.length).setValues([mergedRow]);
      return true;
    }
  }
  return false;
}

/**
 * Gets an existing sheet tab by name, or creates it with the given header row.
 * If sheet already exists but has fewer columns than headers, automatically expands headers.
 */
function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight("bold")
      .setBackground("#ea580c")
      .setFontColor("#ffffff");
    sheet.setFrozenRows(1);
  } else {
    var currentCols = sheet.getLastColumn();
    if (currentCols < headers.length) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length)
        .setFontWeight("bold")
        .setBackground("#ea580c")
        .setFontColor("#ffffff");
    }
  }
  return sheet;
}
