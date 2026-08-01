const SPREADSHEET_ID = "1CkoQeL0sKk0XakKEp0UnIYk6vZfBQLoUvIQGQheay2U";
const DRIVE_FOLDER_ID = "1X_ZQHvgOoLHqfJPaFIbPZ7WsGt3boMcp";
const ADMIN_EMAIL = "uncutlesson@gmail.com";
const SHEET_NAME = "Payment Requests";
const REFERRAL_SHEET_NAME = "Referral Codes";
const QUIZ_SHEET_NAME = "Quiz Submissions";
const COURSE_SHEET_NAME = "Courses";
const ASSIGNMENT_SHEET_NAME = "Assignments";
const OFFER_SHEET_NAME = "Offers";
const REVIEW_SHEET_NAME = "Reviews";
const ADMIN_CODE_PROPERTY = "UNCUT_ADMIN_CODE";
const WHATSAPP_GRAPH_URL_PROPERTY = "WHATSAPP_GRAPH_URL";
const WHATSAPP_ACCESS_TOKEN_PROPERTY = "WHATSAPP_ACCESS_TOKEN";

const HEADERS = [
  "Timestamp",
  "Student Name",
  "Gmail For Drive Access",
  "WhatsApp Number",
  "Selected Course",
  "Amount Paid",
  "Transaction ID / UPI Ref",
  "Payment Screenshot Link",
  "Status",
  "Access Given Date",
  "Notes",
  "Referral Code",
];

const REFERRAL_HEADERS = [
  "Referral Code",
  "Referrer Name",
  "Referrer Gmail",
  "Referrer WhatsApp",
  "Referral Link",
  "Date Created",
  "Total Paid Referrals",
  "Reward Given",
  "Notes",
];

const QUIZ_HEADERS = [
  "Timestamp",
  "Quiz ID",
  "Quiz Topic",
  "Quiz Score",
  "Discount Status",
  "Student Name",
  "Student Gmail",
  "WhatsApp Number",
  "Interested Course",
  "Follow-up Status",
  "Notes",
];

const COURSE_HEADERS = [
  "Course Key",
  "Course Name",
  "Price",
  "Free Video URL",
  "Details URL",
  "Paid Video URL",
  "Image URL",
  "Badge",
  "Description",
  "Category",
  "Drive Folder ID",
  "Active",
];

const ASSIGNMENT_HEADERS = ["Course Key", "Assignment Title", "Assignment URL", "Instructions", "Active"];
const OFFER_HEADERS = ["Offer ID", "Title", "Message", "Button Text", "Button URL", "Active", "Updated At"];
const REVIEW_HEADERS = ["Timestamp", "Student Name", "Course Key", "Review", "Language", "Approved"];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");

    if (isReferralRequest(data)) {
      return saveReferralCode(data);
    }

    if (data.action === "quizSubmission") {
      return saveQuizSubmission(data);
    }

    if (data.action === "reviewSubmission") {
      return saveReviewSubmission(data);
    }

    validatePaymentRequest(data);

    const sheet = getPaymentSheet();
    const screenshotUrl = saveScreenshot(data);

    sheet.appendRow([
      new Date(),
      data.studentName || "",
      data.studentEmail || "",
      data.studentPhone || "",
      data.course || "",
      data.price || "",
      data.transactionId || "",
      screenshotUrl,
      "Pending",
      "",
      "",
      data.referralCode || "",
    ]);

    sendAdminEmail(data, screenshotUrl);
    sendPaymentReceivedEmail(data);

    return jsonResponse({
      ok: true,
      message: "Payment request saved.",
      screenshotUrl,
    });
  } catch (error) {
    return jsonResponse({
      ok: false,
      message: error.message,
    });
  }
}

function isReferralRequest(data) {
  return data.action === "createReferralCode" ||
    Boolean(data.referralLink && data.referralCode && (data.referrerName || data.referrerEmail || data.referrerPhone));
}

function validatePaymentRequest(data) {
  const missingFields = [];

  if (!data.studentName) missingFields.push("studentName");
  if (!data.studentEmail) missingFields.push("studentEmail");
  if (!data.studentPhone) missingFields.push("studentPhone");
  if (!data.course) missingFields.push("course");
  if (!data.price) missingFields.push("price");
  if (!data.screenshotData) missingFields.push("screenshotData");

  if (missingFields.length) {
    throw new Error(`Payment request missing: ${missingFields.join(", ")}`);
  }
}

function saveReferralCode(data) {
  const sheet = getReferralSheet();
  const referralCode = String(data.referralCode || "").trim().toUpperCase();

  if (!referralCode) {
    throw new Error("Referral code is required.");
  }

  sheet.appendRow([
    referralCode,
    data.referrerName || "",
    data.referrerEmail || "",
    data.referrerPhone || "",
    data.referralLink || "",
    new Date(),
    0,
    "No",
    "Created from website referral page",
  ]);

  sendReferralEmail(data);

  return jsonResponse({
    ok: true,
    message: "Referral code saved.",
    referralCode,
  });
}

function saveQuizSubmission(data) {
  const requiredFields = ["quizId", "quizTopic", "quizScore", "studentName", "studentEmail", "studentPhone", "interestedCourse"];
  const missingFields = requiredFields.filter((field) => !String(data[field] || "").trim());

  if (missingFields.length) {
    throw new Error(`Quiz submission missing: ${missingFields.join(", ")}`);
  }

  const sheet = getQuizSheet();
  sheet.appendRow([
    new Date(),
    data.quizId,
    data.quizTopic,
    data.quizScore,
    data.discountStatus || "Not eligible",
    data.studentName,
    data.studentEmail,
    data.studentPhone,
    data.interestedCourse,
    "New",
    "",
  ]);

  sendQuizSubmissionEmail(data);
  return jsonResponse({ ok: true, message: "Quiz submission saved." });
}

function saveReviewSubmission(data) {
  const studentName = String(data.studentName || "").trim();
  const review = String(data.review || "").trim();
  const courseKey = String(data.courseKey || "").trim();
  if (!studentName || !review || !courseKey) {
    throw new Error("Student name, course and review are required.");
  }

  getReviewSheet().appendRow([
    new Date(),
    studentName.slice(0, 100),
    courseKey.slice(0, 80),
    review.slice(0, 1200),
    String(data.language || "Not specified").slice(0, 40),
    "Pending",
  ]);

  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Uncut Lesson review: ${courseKey}`,
    body: `${studentName} submitted a review for ${courseKey}.\n\n${review}\n\nApprove it in the Uncut Lesson Admin dashboard before publishing it.`,
  });
  return jsonResponse({ ok: true, message: "Review submitted for approval." });
}

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || "").trim();

  if (action === "admin") {
    return HtmlService.createHtmlOutputFromFile("AdminDashboard")
      .setTitle("Uncut Lesson Admin Dashboard");
  }

  if (action === "publicCatalog") {
    const payload = { ok: true, courses: getPublicCourses() };
    const callback = String((e && e.parameter && e.parameter.callback) || "").trim();
    return callback ? jsonpResponse(callback, payload) : jsonResponse(payload);
  }

  if (action === "publicAssignments") {
    const payload = { ok: true, assignments: getPublicAssignments() };
    const callback = String((e && e.parameter && e.parameter.callback) || "").trim();
    return callback ? jsonpResponse(callback, payload) : jsonResponse(payload);
  }

  if (action === "publicReviews") {
    const courseKey = String((e && e.parameter && e.parameter.courseKey) || "").trim();
    const payload = { ok: true, reviews: getPublicReviews(courseKey) };
    const callback = String((e && e.parameter && e.parameter.callback) || "").trim();
    return callback ? jsonpResponse(callback, payload) : jsonResponse(payload);
  }

  return jsonResponse({
    ok: true,
    message: "Uncut Lesson payment endpoint is running.",
  });
}

function testSetup() {
  const testData = {
    studentName: "Test Student",
    studentEmail: "test@example.com",
    studentPhone: "9999999999",
    transactionId: "TEST123",
    course: "Basic Course",
    price: "Rs 499",
    screenshotName: "test-payment.txt",
    screenshotType: "text/plain",
    screenshotData: Utilities.base64Encode("Test screenshot file"),
    referralCode: "UL1001",
  };

  const sheet = getPaymentSheet();
  const screenshotUrl = saveScreenshot(testData);

  sheet.appendRow([
    new Date(),
    testData.studentName,
    testData.studentEmail,
    testData.studentPhone,
    testData.course,
    testData.price,
    testData.transactionId,
    screenshotUrl,
    "Pending",
    "",
    "Test row from Apps Script",
    testData.referralCode,
  ]);

  Logger.log(`Test saved. Screenshot URL: ${screenshotUrl}`);
}

function setupReferralSheet() {
  const sheet = getReferralSheet();

  if (sheet.getLastRow() === 1) {
    sheet.appendRow([
      "UL1001",
      "Example Referrer",
      "example@gmail.com",
      "9999999999",
      "https://example.com/payment.html?ref=UL1001",
      new Date(),
      0,
      "No",
      "Replace this example row with your real first code.",
    ]);
  }

  Logger.log("Referral Codes sheet is ready.");
}

function sendReferralEmail(data) {
  const subject = `New referral code created: ${data.referralCode || ""}`;
  const body = [
    "New Referral Code Created",
    "",
    `Referral Code: ${data.referralCode || ""}`,
    `Referral Link: ${data.referralLink || ""}`,
    `Name: ${data.referrerName || ""}`,
    `Gmail: ${data.referrerEmail || ""}`,
    `WhatsApp: ${data.referrerPhone || ""}`,
    "",
    "Copy text for referrer:",
    `Join Uncut_Lesson course and use my referral code ${data.referralCode || ""} at payment time: ${data.referralLink || ""}`,
  ].join("\n");

  MailApp.sendEmail(ADMIN_EMAIL, subject, body);
}

function getPaymentSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  } else {
    ensureHeaders(sheet, HEADERS);
  }

  return sheet;
}

function getReferralSheet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(REFERRAL_SHEET_NAME) || spreadsheet.insertSheet(REFERRAL_SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(REFERRAL_HEADERS);
    sheet.setFrozenRows(1);
  } else {
    ensureHeaders(sheet, REFERRAL_HEADERS);
  }

  return sheet;
}

function getQuizSheet() {
  return getManagedSheet(QUIZ_SHEET_NAME, QUIZ_HEADERS);
}

function getCourseSheet() {
  return getManagedSheet(COURSE_SHEET_NAME, COURSE_HEADERS);
}

function getAssignmentSheet() {
  return getManagedSheet(ASSIGNMENT_SHEET_NAME, ASSIGNMENT_HEADERS);
}

function getOfferSheet() {
  return getManagedSheet(OFFER_SHEET_NAME, OFFER_HEADERS);
}

function getReviewSheet() {
  return getManagedSheet(REVIEW_SHEET_NAME, REVIEW_HEADERS);
}

function getManagedSheet(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  } else {
    ensureHeaders(sheet, headers);
  }

  return sheet;
}

function ensureHeaders(sheet, headers) {
  const currentColumnCount = Math.max(sheet.getLastColumn(), headers.length);
  const currentHeaders = sheet.getRange(1, 1, 1, currentColumnCount).getValues()[0];

  headers.forEach((header, index) => {
    if (currentHeaders[index] !== header) {
      sheet.getRange(1, index + 1).setValue(header);
    }
  });
}

function saveScreenshot(data) {
  if (!data.screenshotData) return "";

  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const fileName = createScreenshotFileName(data);
  const bytes = Utilities.base64Decode(data.screenshotData);
  const blob = Utilities.newBlob(bytes, data.screenshotType || "image/png", fileName);
  const file = folder.createFile(blob);

  return file.getUrl();
}

function createScreenshotFileName(data) {
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");
  const name = cleanFilePart(data.studentName || "student");
  const course = cleanFilePart(data.course || "course");
  const originalName = cleanFilePart(data.screenshotName || "payment-screenshot.png");

  return `${timestamp}-${name}-${course}-${originalName}`;
}

function cleanFilePart(value) {
  return String(value)
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function sendAdminEmail(data, screenshotUrl) {
  const subject = `New payment request: ${data.course || "Course"}`;
  const body = [
    "New Course Payment Request",
    "",
    `Name: ${data.studentName || ""}`,
    `Gmail: ${data.studentEmail || ""}`,
    `WhatsApp: ${data.studentPhone || ""}`,
    `Course: ${data.course || ""}`,
    `Amount: ${data.price || ""}`,
    `Transaction ID / UPI Ref: ${data.transactionId || ""}`,
    `Referral Code: ${data.referralCode || ""}`,
    `Screenshot: ${screenshotUrl || ""}`,
    "",
    "Open the Google Sheet, verify payment, then add the Gmail to the correct Google Drive course folder.",
  ].join("\n");

  MailApp.sendEmail(ADMIN_EMAIL, subject, body);
}

function sendQuizSubmissionEmail(data) {
  const subject = `New quiz submission: ${data.interestedCourse || data.quizTopic || "Course"}`;
  const body = [
    "New Quiz Submission",
    "",
    `Quiz ID: ${data.quizId || ""}`,
    `Quiz topic: ${data.quizTopic || ""}`,
    `Score: ${data.quizScore || ""}/20`,
    `Discount: ${data.discountStatus || ""}`,
    `Name: ${data.studentName || ""}`,
    `Gmail: ${data.studentEmail || ""}`,
    `WhatsApp: ${data.studentPhone || ""}`,
    `Interested course: ${data.interestedCourse || ""}`,
  ].join("\n");

  MailApp.sendEmail(ADMIN_EMAIL, subject, body);
}

function setupLearningAdmin() {
  getPaymentSheet();
  getReferralSheet();
  getQuizSheet();
  const courseSheet = getCourseSheet();
  getAssignmentSheet();
  getOfferSheet();
  getReviewSheet();
  seedCourseCatalog(courseSheet);
  installPaymentStatusTrigger();
  return "Uncut Lesson admin sheets are ready. Set UNCUT_ADMIN_CODE in Script Properties before opening the dashboard.";
}

function seedCourseCatalog(sheet) {
  if (sheet.getLastRow() > 1) return;

  const rows = [
    ["basic", "Basic Course", "Rs 499", "free-video-basic.html", "course-basic.html", "learning/index.html?course=ms-basic", "assets/Basic.jpg", "Free preview", "MS Word and Paint basics", "foundation", "", "Yes"],
    ["advanced-excel", "Advanced Excel + MS-Access", "Rs 999", "free-video-advanced-excel.html", "course-advanced-excel.html", "learning/index.html?course=advanced-excel", "assets/Advance Excel.jpg", "Bestseller", "Formulas, lookup, pivots and reports", "professional", "", "Yes"],
    ["tally-prime-gst", "Tally Prime + GST", "Rs 1999", "free-video-tally-prime-gst.html", "course-tally-prime-gst.html", "learning/index.html?course=tally-prime-gst", "assets/Tally Prime.jpg", "Limited offer", "GST, TDS and inventory management", "professional", "", "Yes"],
    ["tally-erp", "Tally ERP", "Rs 1499", "free-video-tally-erp.html", "course-tally-erp.html", "learning/index.html?course=tally-erp", "assets/Tally ERP.jpg", "Free preview", "Voucher entry, inventory and reports", "foundation", "", "Yes"],
    ["power-bi", "Power BI A to Z", "Rs 1999", "free-video-power-bi.html", "course-power-bi.html", "learning/index.html?course=power-bi", "assets/Power BI.jpg", "Free preview", "Power Query, DAX and dashboards", "professional", "", "Yes"],
    ["sap-fico", "SAP FICO", "Rs 999", "free-video-sap-fico.html", "course-sap-fico.html", "learning/index.html?course=sap-fico", "assets/SAP-FICO.jpg", "Career skill", "Finance, GL and cost centres", "professional", "", "Yes"],
    ["sap-s4-hana", "SAP S4 HANA", "Rs 999", "free-video-sap-s4-hana.html", "course-sap-s4-hana.html", "learning/index.html?course=sap-s4-hana", "assets/SAP S4 HANA.jpg", "Career skill", "Fiori, finance and reporting", "professional", "", "Yes"],
    ["peachtree", "Microsoft Peachtree", "Rs 999", "free-video-microsoft-peachtree.html", "course-microsoft-peachtree.html", "learning/index.html?course=peachtree", "assets/Peachtree.jpg", "Free preview", "Business accounting and reports", "professional", "", "Yes"],
  ];

  sheet.getRange(2, 1, rows.length, COURSE_HEADERS.length).setValues(rows);
}

function installPaymentStatusTrigger() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const exists = ScriptApp.getProjectTriggers().some((trigger) => trigger.getHandlerFunction() === "onPaymentSheetEdit");
  if (!exists) {
    ScriptApp.newTrigger("onPaymentSheetEdit").forSpreadsheet(spreadsheet).onEdit().create();
  }
}

function onPaymentSheetEdit(event) {
  const range = event && event.range;
  if (!range || range.getSheet().getName() !== SHEET_NAME || range.getRow() === 1) return;

  const sheet = range.getSheet();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusColumn = headers.indexOf("Status") + 1;
  if (range.getColumn() !== statusColumn) return;

  const row = getSheetRowObject(sheet, range.getRow());
  const status = String(row.Status || "").toLowerCase();
  if (status !== "access given" && status !== "approved") return;
  sendPaymentStatusEmail(row);
}

function getPublicCourses() {
  const courseSheet = getCourseSheet();
  seedCourseCatalog(courseSheet);
  return readSheetRows(courseSheet)
    .filter((course) => String(course.Active || "Yes").toLowerCase() !== "no")
    .map((course) => ({
      key: course["Course Key"],
      name: course["Course Name"],
      price: course.Price,
      freeVideoUrl: course["Free Video URL"],
      detailsUrl: course["Details URL"],
      paidVideoUrl: course["Paid Video URL"],
      imageUrl: course["Image URL"],
      badge: course.Badge,
      description: course.Description,
      category: course.Category,
    }));
}

function getPublicAssignments() {
  return readSheetRows(getAssignmentSheet())
    .filter((assignment) => String(assignment.Active || "Yes").toLowerCase() !== "no")
    .map((assignment) => ({
      courseKey: assignment["Course Key"],
      title: assignment["Assignment Title"],
      url: assignment["Assignment URL"],
      instructions: assignment.Instructions,
    }));
}

function getPublicReviews(courseKey) {
  return readSheetRows(getReviewSheet())
    .filter((review) => String(review.Approved || "").toLowerCase() === "yes")
    .filter((review) => !courseKey || String(review["Course Key"] || "").trim() === courseKey)
    .slice(-12)
    .reverse()
    .map((review) => ({
      studentName: review["Student Name"],
      courseKey: review["Course Key"],
      review: review.Review,
      language: review.Language,
    }));
}

function getAdminDashboard(accessCode) {
  requireAdmin(accessCode);
  const courseSheet = getCourseSheet();
  seedCourseCatalog(courseSheet);

  return {
    courses: readSheetRows(courseSheet),
    payments: readSheetRows(getPaymentSheet()).slice(-100).reverse(),
    quizSubmissions: readSheetRows(getQuizSheet()).slice(-100).reverse(),
    assignments: readSheetRows(getAssignmentSheet()),
    offers: readSheetRows(getOfferSheet()),
    reviews: readSheetRows(getReviewSheet()).slice(-100).reverse(),
  };
}

function saveAdminCourse(accessCode, record) {
  requireAdmin(accessCode);
  const courseKey = String(record["Course Key"] || "").trim();
  if (!courseKey) throw new Error("Course Key is required.");
  upsertSheetRecord(getCourseSheet(), COURSE_HEADERS, "Course Key", record);
  return { ok: true, message: "Course saved." };
}

function saveAdminAssignment(accessCode, record) {
  requireAdmin(accessCode);
  if (!String(record["Course Key"] || "").trim() || !String(record["Assignment Title"] || "").trim()) {
    throw new Error("Course Key and Assignment Title are required.");
  }
  upsertSheetRecord(getAssignmentSheet(), ASSIGNMENT_HEADERS, "Assignment Title", record);
  return { ok: true, message: "Assignment saved." };
}

function saveAdminOffer(accessCode, record) {
  requireAdmin(accessCode);
  const offer = Object.assign({}, record, {
    "Offer ID": record["Offer ID"] || `OFFER-${Date.now()}`,
    "Updated At": new Date(),
  });
  upsertSheetRecord(getOfferSheet(), OFFER_HEADERS, "Offer ID", offer);
  return { ok: true, message: "Offer saved." };
}

function updatePaymentRequest(accessCode, rowNumber, status, notes, grantAccess) {
  requireAdmin(accessCode);
  const sheet = getPaymentSheet();
  const safeRowNumber = Number(rowNumber);
  if (!safeRowNumber || safeRowNumber < 2 || safeRowNumber > sheet.getLastRow()) {
    throw new Error("Payment request was not found.");
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const statusColumn = headers.indexOf("Status") + 1;
  const accessDateColumn = headers.indexOf("Access Given Date") + 1;
  const notesColumn = headers.indexOf("Notes") + 1;

  if (grantAccess) {
    grantDriveAccessForPayment(sheet, safeRowNumber);
    status = "Access Given";
    sheet.getRange(safeRowNumber, accessDateColumn).setValue(new Date());
  }

  if (statusColumn) sheet.getRange(safeRowNumber, statusColumn).setValue(status || "Pending");
  if (notesColumn) sheet.getRange(safeRowNumber, notesColumn).setValue(notes || "");
  const payment = getSheetRowObject(sheet, safeRowNumber);

  if (String(status || "").toLowerCase() === "approved" || String(status || "").toLowerCase() === "access given") {
    sendPaymentStatusEmail(payment);
  }

  return { ok: true, message: grantAccess ? "Drive access granted and student notified." : "Payment request updated." };
}

function grantDriveAccessForPayment(paymentSheet, rowNumber) {
  const payment = getSheetRowObject(paymentSheet, rowNumber);
  const course = readSheetRows(getCourseSheet()).find((item) => String(item["Course Name"] || "").trim() === String(payment["Selected Course"] || "").trim());
  const folderId = course && String(course["Drive Folder ID"] || "").trim();

  if (!folderId) {
    throw new Error("Add the Google Drive Folder ID for this course in the Courses sheet before granting access.");
  }

  DriveApp.getFolderById(folderId).addViewer(payment["Gmail For Drive Access"]);
}

function sendLearningUpdate(accessCode, audience, subject, message) {
  requireAdmin(accessCode);
  const recipients = collectUpdateRecipients(audience);
  if (!subject || !message) throw new Error("Subject and message are required.");
  if (!recipients.length) throw new Error("No recipients were found for this audience.");

  recipients.forEach((email) => MailApp.sendEmail(email, subject, message));
  return { ok: true, message: `Email update sent to ${recipients.length} students.` };
}

function updateReviewApproval(accessCode, rowNumber, approved) {
  requireAdmin(accessCode);

  const sheet = getReviewSheet();
  const row = Number(rowNumber);
  if (!row || row < 2 || row > sheet.getLastRow()) {
    throw new Error("Review not found.");
  }

  const approvedColumn = REVIEW_HEADERS.indexOf("Approved") + 1;
  if (!approvedColumn) {
    throw new Error("The Reviews sheet is missing the Approved column.");
  }

  sheet.getRange(row, approvedColumn).setValue(approved ? "Yes" : "No");
  return { ok: true, rowNumber: row, approved: !!approved };
}

function collectUpdateRecipients(audience) {
  const paymentEmails = readSheetRows(getPaymentSheet()).map((row) => row["Gmail For Drive Access"]);
  const quizEmails = readSheetRows(getQuizSheet()).map((row) => row["Student Gmail"]);
  const emails = audience === "quiz" ? quizEmails : audience === "all" ? paymentEmails.concat(quizEmails) : paymentEmails;
  return [...new Set(emails.map((email) => String(email || "").trim().toLowerCase()).filter(Boolean))];
}

function sendPaymentStatusEmail(payment) {
  const email = String(payment["Gmail For Drive Access"] || "").trim();
  if (!email) return;
  const status = payment.Status || "Updated";
  const subject = `Uncut Lesson course access update: ${payment["Selected Course"] || "Course"}`;
  const body = [
    `Hello ${payment["Student Name"] || "Student"},`,
    "",
    `Your payment request for ${payment["Selected Course"] || "your course"} is now: ${status}.`,
    status === "Access Given" ? "Your Gmail has been added for course video access. Please open the Learning section with the same Gmail." : "We will contact you if any more information is needed.",
    "",
    "Uncut Lesson",
  ].join("\n");
  MailApp.sendEmail(email, subject, body);
}

function sendPaymentReceivedEmail(data) {
  const email = String(data.studentEmail || "").trim();
  if (!email) return;

  MailApp.sendEmail({
    to: email,
    subject: `We received your Uncut Lesson payment request: ${data.course || "Course"}`,
    body: [
      `Hello ${data.studentName || "Student"},`,
      "",
      `We received your payment request for ${data.course || "your course"}.`,
      "Our team will verify it and email you when course access is available.",
      "",
      "Uncut Lesson",
    ].join("\n"),
  });
}

function sendWhatsAppTemplate(phoneNumber, templateName, languageCode, components) {
  const properties = PropertiesService.getScriptProperties();
  const graphUrl = properties.getProperty(WHATSAPP_GRAPH_URL_PROPERTY);
  const accessToken = properties.getProperty(WHATSAPP_ACCESS_TOKEN_PROPERTY);
  if (!graphUrl || !accessToken) {
    throw new Error("Set WHATSAPP_GRAPH_URL and WHATSAPP_ACCESS_TOKEN in Script Properties before sending WhatsApp updates.");
  }

  const payload = {
    messaging_product: "whatsapp",
    to: String(phoneNumber || "").replace(/\D/g, ""),
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode || "en_US" },
      components: components || [],
    },
  };

  return UrlFetchApp.fetch(graphUrl, {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: `Bearer ${accessToken}` },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  }).getContentText();
}

function sendAdminWhatsAppUpdate(accessCode, phoneNumber, templateName, languageCode) {
  requireAdmin(accessCode);
  if (!phoneNumber || !templateName) {
    throw new Error("WhatsApp number and approved template name are required.");
  }
  return sendWhatsAppTemplate(phoneNumber, templateName, languageCode || "en_US", []);
}

function requireAdmin(accessCode) {
  const configuredCode = PropertiesService.getScriptProperties().getProperty(ADMIN_CODE_PROPERTY);
  if (!configuredCode) {
    throw new Error("Set UNCUT_ADMIN_CODE in Apps Script Project Settings before using the admin dashboard.");
  }
  if (String(accessCode || "") !== configuredCode) {
    throw new Error("Incorrect admin access code.");
  }
}

function upsertSheetRecord(sheet, headers, keyHeader, record) {
  const key = String(record[keyHeader] || "").trim();
  const rows = readSheetRows(sheet);
  const existing = rows.find((row) => String(row[keyHeader] || "").trim() === key);
  const values = headers.map((header) => record[header] === undefined ? "" : record[header]);

  if (existing) {
    sheet.getRange(existing.rowNumber, 1, 1, headers.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
}

function readSheetRows(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();
  if (lastRow < 2 || !lastColumn) return [];

  const values = sheet.getRange(1, 1, lastRow, lastColumn).getValues();
  const headers = values[0];
  return values.slice(1).map((row, index) => {
    const record = { rowNumber: index + 2 };
    headers.forEach((header, columnIndex) => {
      record[header] = serializeCell(row[columnIndex]);
    });
    return record;
  });
}

function getSheetRowObject(sheet, rowNumber) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const values = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  const record = { rowNumber };
  headers.forEach((header, index) => {
    record[header] = serializeCell(values[index]);
  });
  return record;
}

function serializeCell(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
  }
  return value;
}

function jsonpResponse(callback, payload) {
  if (!/^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callback)) {
    throw new Error("Invalid JSONP callback.");
  }
  return ContentService
    .createTextOutput(`${callback}(${JSON.stringify(payload)});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
