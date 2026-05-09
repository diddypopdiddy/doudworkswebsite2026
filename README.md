# Vince Doud Website

Static multi-page expert profile and offer site for Vince Doud. No build step is required.

## Files

- `index.html`: homepage
- `services.html`: workshop menu and service formats
- `speaking.html`: speaking and presentation path
- `approach.html`: AI Production Framework and learning model
- `about.html`: founder story and credibility
- `book.html`: contact page
- `ai-permit-to-ai-license.html`: flagship series landing page
- `ai-permit-game.html`: AI Permit Game product/inquiry page
- `district-ai-professional-development.html`: district buyer landing page
- `responsible-ai-for-schools.html`: responsible-use landing page
- `ai-workflow-training-for-educators.html`: workflow training landing page
- `faq.html`: format and delivery FAQ
- `styles.css`: shared design system and responsive layout
- `script.js`: mobile nav, reveal animations, CTA tracking, and contact form behavior
- `MEDIA_BRIDGE.md`: plain workflow for linking published YouTube videos/resources to relevant website pages and back from YouTube descriptions

## Media bridge

Use `MEDIA_BRIDGE.md` after a video or resource is public. The bridge is not a technical integration; it is the editorial workflow for linking relevant website pages to YouTube and linking YouTube descriptions back to the site.

## Run locally

Use any static server. For example:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## GoDaddy hosting

This project is ready for standard static hosting.

### If you use GoDaddy shared hosting

1. Upload all files in this folder to `public_html/`.
2. Make sure `index.html` lives directly inside `public_html/`.
3. Confirm that `styles.css`, `script.js`, `favicon.svg`, `robots.txt`, and `sitemap.xml` are in the same directory.
4. Point your domain to that hosting account if it is not already connected.

### If you use GoDaddy only for the domain

1. Host these files anywhere that serves static websites.
2. Point the GoDaddy DNS records to that host.
3. Keep the canonical URLs and sitemap aligned with the final domain.

## Analytics

This site is wired for [Plausible](https://plausible.io/) using the `vincedoud.com` domain.

- The script is included in the page heads.
- CTA and contact clicks are tracked in `script.js`.
- Data will start appearing once the domain is added and verified in Plausible.

## Content to review after launch

- The Contact page form is connected to the private Google Apps Script sending endpoint.
- Confirm the exact published name for Camden County Educational Services Commission if you want to keep that on-site.
- Add any additional attributed testimonials, district names, or logos you have permission to publish.
- If you replace the contact endpoint later, update `book.html`, `script.js`, and `BOOKING-SETUP.md` together.
