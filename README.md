# Simple Static Website

This is a minimal static website scaffold created for you.

Files added:

- `index.html` — main page
- `styles.css` — styles
- `script.js` — small interaction handlers

Admin page

- `admin.html` — a client-side protected admin page. It uses `admin.js` which checks a password in-browser and stores a session flag in `sessionStorage`.
- `admin.js` — client-side login logic. The default password is `changeme` in the file; change it or configure server-side auth for production.

How to view locally

1. Open `index.html` directly in your browser, or run a local static server.

2. To run a quick local server (requires Python):

```powershell
# from the project folder
python -m http.server 8000
# then open http://localhost:8000 in a browser
```

Next steps

- Customize content in `index.html`.
- Hook the contact form to a backend or service.
- I can deploy this to GitHub Pages or Netlify if you want.

Security note

- The `admin.html` protection is purely client-side and not secure for real deployments. For true admin-only access, enable server-side authentication (Basic auth, OAuth, or an authenticated backend) or host behind a server that supports access control.
