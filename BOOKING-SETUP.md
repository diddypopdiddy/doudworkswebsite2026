# Vince Doud Contact Form Setup

The Contact page now uses a native form that collects the context needed before sending a booking link:

- Name
- Email
- Role
- School / district / organization
- Timeline
- Support type
- What they are trying to solve

The public page does not show a direct email address or phone number. The live form is connected to the Google Apps Script web app in this folder; use this guide if the endpoint ever needs to be recreated or replaced.

The form uses JavaScript for the best in-page experience, but the HTML also has a real `action` and `method="post"` fallback. If the Apps Script code changes, keep JSON submissions and normal form-encoded submissions supported.

## Files involved

- Contact page: `/Users/diddypopdiddy/Documents/Codex/Projects/Vince Doud/02_Media/Website/book.html`
- Paid public workshop section: `/Users/diddypopdiddy/Documents/Codex/Projects/Vince Doud/02_Media/Website/services.html#live-ai-workshops`
- Shared form behavior: `/Users/diddypopdiddy/Documents/Codex/Projects/Vince Doud/02_Media/Website/script.js`
- Email endpoint script: `/Users/diddypopdiddy/Documents/Codex/Projects/Vince Doud/02_Media/Website/google-apps-script/Code.gs`

## Workshop registration links

The live workshop section on `services.html` points to the public Calendly event types:

- AI Modes Workshop: `https://calendly.com/hello-vincedoud/ai-modes-workshop`
- AI Tool Mode Workshop: `https://calendly.com/hello-vincedoud/ai-tool-mode-workshop`

Public pricing shown on the website should match the Calendly payment settings:

- AI Modes Workshop: $99/person
- AI Tool Mode Workshop: $149/person

Do not add Stripe payment links directly to the website. Payment should stay inside the Calendly event flow once Calendly and Stripe are connected.

## Recreate or replace the form endpoint

1. Create or open the Google Sheet that should collect inquiries.
2. Open Apps Script from that Sheet.
3. Paste in `google-apps-script/Code.gs`.
4. In `Code.gs`, update `NOTIFICATION_RECIPIENTS` if the notification inbox should change.
5. Deploy as a Web App.
6. Set access to "Anyone" so the public site can submit the form.
7. Copy the Web App URL.
8. In `book.html`, paste that URL into both the contact form's `data-endpoint=""` value and its `action=""` value.

## Test checklist

1. Load `book.html`.
2. Submit a short test message.
3. Confirm the message appears in the Sheet.
4. Confirm the private inbox receives the email notification.
5. If the page says the endpoint is not connected, the `data-endpoint` value is still blank.
6. If you redeploy the Apps Script endpoint, confirm a normal browser form submission still works as a no-JavaScript fallback.
