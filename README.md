# Wedding website

Static single-page wedding invitation with a countdown, schedule, dress code,
add-to-calendar buttons and an RSVP form backed by Google Sheets.

**Live:** https://gellers.ru/

## Stack

- Plain HTML, CSS and JavaScript — no build step, no dependencies
- Hosting: GitHub Pages, deployed by GitHub Actions on every push to `main`
- RSVP backend: Google Apps Script web app writing to a Google Sheet

## Project structure

```
index.html                  Page content
css/style.css               Styles (design tokens at the top)
js/main.js                  Countdown, calendar, personal greeting, RSVP (config at the top)
favicon.svg
robots.txt                  Blocks search engine indexing
google-apps-script/rsvp.gs  RSVP endpoint source (deployed manually to Apps Script)
.github/workflows/          Pages deployment
```

## Local development

Open `index.html` in a browser. Edit, save, refresh.

## Configuration

All event settings (date, time zone, title, location, RSVP endpoint) live in
the `CONFIG` object at the top of `js/main.js`. Content still to be finalised is
marked with `TODO` comments in `index.html`.

## Personal invitation links

Append `?guest=<greeting>` to the URL to replace the default greeting, e.g.
`https://gellers.ru/?guest=Дорогая бабушка`.

## RSVP backend

Setup and redeploy instructions are in the header of
[`google-apps-script/rsvp.gs`](google-apps-script/rsvp.gs). Changes to that file
are **not** deployed automatically — redeploy a new version in Apps Script.

## Deployment

Push to `main`. The workflow in `.github/workflows/deploy.yml` publishes only
the public site files to GitHub Pages.

## Custom domain

The site is served at `gellers.ru`. The custom domain is set in the repository's
Pages settings (no `CNAME` file is needed with Actions-based deployments).

DNS records (managed at the registrar):

| Type  | Name  | Value                                   |
|-------|-------|-----------------------------------------|
| A     | `@`   | `185.199.108.153`                       |
| A     | `@`   | `185.199.109.153`                       |
| A     | `@`   | `185.199.110.153`                       |
| A     | `@`   | `185.199.111.153`                       |
| CNAME | `www` | `gellerdev.github.io`                   |
