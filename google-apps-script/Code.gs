const SHEET_NAME = "Form Responses";
const NOTIFICATION_RECIPIENTS = [
  "vinceandrewdoud@gmail.com",
  "doudworks@gmail.com"
];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    const sheet = getOrCreateSheet_();

    sheet.appendRow([
      new Date(),
      payload.name || "",
      payload.email || "",
      payload.organization || "",
      payload.audience || "",
      payload.format || "",
      payload.timeline || "",
      payload.goal || "",
      payload.source || "",
      payload.submittedAt || ""
    ]);

    sendNotification_(payload);

    return jsonResponse_({
      ok: true
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error.message
    });
  }
}

function doGet() {
  return jsonResponse_({
    ok: true,
    message: "DoudWorks booking intake endpoint is running."
  });
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Name",
      "Email",
      "Organization",
      "Audience Type",
      "Workshop Format",
      "Timeline",
      "Goal",
      "Source URL",
      "Submitted At (ISO)"
    ]);
  }

  return sheet;
}

function sendNotification_(payload) {
  const subject = "New DoudWorks workshop inquiry";
  const body = [
    "A new workshop inquiry was submitted.",
    "",
    "Name: " + (payload.name || "Not provided"),
    "Email: " + (payload.email || "Not provided"),
    "Organization: " + (payload.organization || "Not provided"),
    "Audience type: " + (payload.audience || "Not provided"),
    "Workshop format: " + (payload.format || "Not provided"),
    "Timeline: " + (payload.timeline || "Not provided"),
    "",
    "What they are trying to solve:",
    payload.goal || "Not provided",
    "",
    "Source page: " + (payload.source || "Not provided"),
    "Submitted at: " + (payload.submittedAt || "Not provided")
  ].join("\n");

  MailApp.sendEmail({
    to: NOTIFICATION_RECIPIENTS.join(","),
    subject,
    body,
    replyTo: payload.email || undefined
  });
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
