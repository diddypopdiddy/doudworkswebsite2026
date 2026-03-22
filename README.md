# DoudWorks Website

Static multi-page marketing site for DoudWorks. No build step is required.

## Files

- `index.html`: homepage
- `services.html`: workshop menu and booking formats
- `approach.html`: DoudWorks framework and learning model
- `about.html`: founder story and credibility
- `book.html`: contact and booking page
- `styles.css`: shared design system and responsive layout
- `script.js`: mobile nav, reveal animations, and booking form behavior

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

## Content to review before launch

- Confirm the preferred phone number and email address.
- Replace any copy that should be more specific to your services or audience.
- If you use Calendly or another scheduler, swap the mail-based booking flow in `book.html` and `script.js` for that link or embed.
- Add real photos or branded graphics if you want richer visual storytelling.
