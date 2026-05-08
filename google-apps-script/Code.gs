const SHEET_NAME = "Contact Inquiries";
const NOTIFICATION_RECIPIENTS = ["vinceandrewdoud@gmail.com"];

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");

    if (payload.website) {
      return jsonResponse_({
        ok: true
      });
    }

    const sheet = getOrCreateSheet_();
    const message = payload.message || payload.goal || "";

    sheet.appendRow([
      new Date(),
      payload.name || "",
      payload.email || "",
      message,
      payload.organization || "",
      payload.audience || "",
      payload.format || "",
      payload.timeline || "",
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
    message: "Website contact endpoint is running."
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
      "Message",
      "Organization",
      "Audience Type",
      "Workshop Format",
      "Timeline",
      "Source URL",
      "Submitted At (ISO)"
    ]);
  }

  return sheet;
}

function sendNotification_(payload) {
  const recipients = getNotificationRecipients_();

  if (!recipients.length) {
    return;
  }

  const subject = "New website inquiry";
  const message = payload.message || payload.goal || "Not provided";
  const body = [
    "A new website inquiry was submitted.",
    "",
    "Name: " + (payload.name || "Not provided"),
    "Email: " + (payload.email || "Not provided"),
    "",
    "Message:",
    message,
    "",
    "Organization: " + (payload.organization || "Not provided"),
    "Audience type: " + (payload.audience || "Not provided"),
    "Workshop format: " + (payload.format || "Not provided"),
    "Timeline: " + (payload.timeline || "Not provided"),
    "",
    "Source page: " + (payload.source || "Not provided"),
    "Submitted at: " + (payload.submittedAt || "Not provided")
  ].join("\n");

  MailApp.sendEmail({
    to: recipients.join(","),
    subject,
    body,
    replyTo: payload.email || undefined
  });
}

function getNotificationRecipients_() {
  return NOTIFICATION_RECIPIENTS
    .map(function (recipient) {
      return recipient.trim();
    })
    .filter(Boolean);
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON
  );
}
