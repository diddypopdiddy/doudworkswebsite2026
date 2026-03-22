# DoudWorks Booking Form Setup

This site is now prepared to submit the booking form to a Google Apps Script web app.

## What this setup does

- Stores every submission as a new row in your Google Sheet
- Sends notification emails to:
  - `vinceandrewdoud@gmail.com`
  - `doudworks@gmail.com`
- Keeps the form styled as part of the DoudWorks site

## Files already prepared

- Site form: `/Users/diddypopdiddy/Desktop/codedprojects/3.5 doud works/book.html`
- Form submit logic: `/Users/diddypopdiddy/Desktop/codedprojects/3.5 doud works/script.js`
- Google Apps Script code to paste: `/Users/diddypopdiddy/Desktop/codedprojects/3.5 doud works/google-apps-script/Code.gs`

## Google Sheet to use

- [Booking Intake Sheet](https://docs.google.com/spreadsheets/d/13EajUXNK91WYnKCIqHL1MI3JqoSb9FNulbGH8TOYh5w/edit?usp=sharing)

## Setup steps

1. Open your Google Sheet.
2. In the sheet, click `Extensions` -> `Apps Script`.
3. Replace the default script with the contents of `google-apps-script/Code.gs`.
4. Save the project.
5. Click `Deploy` -> `New deployment`.
6. Choose type: `Web app`.
7. Description: `DoudWorks booking intake`.
8. Execute as: `Me`.
9. Who has access: `Anyone`.
10. Deploy and authorize the script.
11. Copy the web app URL.
12. Open `/Users/diddypopdiddy/Desktop/codedprojects/3.5 doud works/book.html`.
13. Find `data-form-endpoint="PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE"`.
14. Replace that placeholder with your deployed web app URL.

## Test checklist

1. Submit the form on the Book page.
2. Confirm a new row appears in the sheet.
3. Confirm both emails receive a notification.
4. Confirm the on-page success message appears.

## Notes

- The script will create a tab named `Form Responses` if it does not exist.
- If you redeploy Apps Script and get a new web app URL, update `data-form-endpoint` in `book.html`.
- If email notifications do not arrive immediately, check spam/promotions first.
