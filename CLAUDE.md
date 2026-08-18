# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The marketing website for "Naturheilpraxis hilfreich," a Heilpraktikerin (naturopath) practice run by Lisa Serrano Martin-Prieto in Moers, Germany. It's a static site with no build system, no package manager, and no server-side code — plain HTML/CSS/JS deployed as-is.

Live at `naturheilpraxis-hilfreich.de` (see `CNAME`). All page content is in German.

## Architecture

- **`index.html`** — the entire one-page site. All CSS is in a single `<style>` block in `<head>`; all JS is in a single `<script>` block before `</body>`. Content is organized as stacked `<section id="...">` elements (`#start`, `#behandlung`, `#therapie`, `#homoeopathie`, `#balancer`, `#honorar`, `#uebermich`, `#faq`, `#kontakt`, `#impressum`, `#datenschutz`), and the nav/footer link to these via same-page anchors (`#section-id`). There is no client-side routing — navigating between "pages" just means scrolling to a different `<section>`.
  - CSS custom properties for the palette (sage green, cream, gold) are defined once on `:root` in the `<style>` block — reuse these vars (`--sage`, `--sage-dk`, `--sage-lt`, `--cream`, `--warm`, `--text`, `--muted`, `--border`, `--gold`) rather than hardcoding colors.
  - Inline JS handles: mobile nav toggle (`toggleNav`/`closeNav`), FAQ accordion (`toggleFaq`), and the contact form submission (`handleForm`), which POSTs to Formspree (`https://formspree.io/f/mykaqerp`) via `fetch` and shows an inline success/error message instead of navigating away.
  - The site is legally required to carry `#impressum` (Impressum/legal notice, per German TMG) and `#datenschutz` (privacy policy, per GDPR/DSGVO) sections — treat these as content that must stay accurate, not boilerplate to trim.
- **`termin.html`** — a standalone appointment-booking calendar (FullCalendar.js via CDN) with a modal booking form (also posts to the same Formspree endpoint). **This page is currently orphaned**: nothing in `index.html` links to it (the nav's booking CTA now points to an external "Patientenportal" at `pportal2.weltland.net` instead). It also references `logo.png`, whereas `index.html` uses `hilfreich_Naturheilpraxis_Logo.svg`. Available appointment slots are hardcoded in a `SLOTS` array directly in the inline `<script>`; "booked" state is tracked client-side only via `localStorage` (`bookedSlots`) — this is a soft UI lock, not a real reservation system (no server validates or removes slots), so double-booking across browsers/devices is possible. If asked to work on booking/scheduling, confirm with the user whether `termin.html` should be re-linked, replaced, or left as-is before investing effort in it.
- **Images**: `foto-hero.jpg`, `foto-heilpraktikerin.jpg`, `hilfreich_Naturheilpraxis_Logo.svg` are used by `index.html`. `logo.png` is used only by the orphaned `termin.html`. `logo.jpg` is unreferenced by any HTML file — check before deleting, but don't assume it's load-bearing.
- **`serranomp_website.zip`** — an old zipped snapshot of `index.html`. Not part of the deployed site; likely a backup, not a build artifact to regenerate.

## Development workflow

There is no build, lint, test, or package install step — this is hand-authored static HTML/CSS/JS. To work on it:

- Edit `index.html` (or `termin.html`) directly.
- Preview locally by opening the file in a browser directly, or serving the directory (e.g. `python3 -m http.server`) since the Google Maps `<iframe>` and Formspree `fetch` calls behave more realistically over `http://` than `file://`.
- There are no automated tests. Verify changes by opening the page and manually checking the affected section, especially responsive behavior — the CSS has breakpoints at `820px` (hero layout), `768px` (nav hamburger, about/kontakt layout), and `500px` (section padding).

## Deployment

Deployment is fully automated via `.github/workflows/pages.yml`: any push to `main` uploads the repository root as-is to GitHub Pages (no build step in the workflow either — it deploys the raw files). Pushing to `main` deploys immediately; there is no staging environment or preview step.

## Content conventions

- Keep all visitor-facing copy in German, matching the existing tone (calm, professional, first-person from the practitioner's perspective in some sections like `#uebermich`).
- Pricing (Ersttermin 149 €, Folgetermin 95 €, Balancer 69–222 €) appears in multiple places (`#honorar` section, `#balancer` section, `#faq` answers, and `termin.html`'s legend/modal) — if a price changes, update it everywhere it's echoed, not just the primary pricing table.
- The Formspree endpoint (`f/mykaqerp`) is shared between `index.html`'s contact form and `termin.html`'s booking form. Both forms explicitly ask users *not* to submit health/medical data through the form (a deliberate GDPR-driven constraint) — preserve that notice if touching either form.
