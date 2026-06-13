# Aquatic Pool Services

Marketing website for **Aquatic Pool Services** — pool cleaning, maintenance, and repair across Southwest Florida.

- **Live site:** https://btabiado.github.io/aquatic-pool-services/
- **Phone:** (239) 357-6622

## Stack
Static site — plain HTML/CSS/JS, no build step. Deployed via GitHub Pages.

```
index.html     # page
styles.css     # styling
app.js         # nav, scroll reveals, lightbox, quote-to-text form
images/        # web-optimized photos
```

## Editing content
- Phone number lives in `index.html` (tel:/sms: links + visible text) and `app.js` (`BUSINESS_PHONE`).
- Service-area cities: the `#area` section in `index.html`.
- Hours: search `Mon–Sat` in `index.html`.
- The quote form opens a pre-filled SMS to the business number (no backend). To collect form
  submissions by email instead, wire the form to a free service like Formspree.
