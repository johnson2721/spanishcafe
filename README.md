# ☕ SPANISH CAFE – Online Food Ordering System

> **Fresh • Affordable • Delicious**
> A complete, responsive online food ordering website for SPANISH CAFE.

**Live site:** https://johnson2721.github.io/spanishcafe/ (published automatically from `main` by GitHub Actions)

---

## 🚀 Features

- 🎨 **Beautiful UI** – warm restaurant colors, Poppins typography, fully responsive
- 🛒 **Live Order Summary** – cart with quantities and a running grand total
- 📱 **M-PESA payments** – Pochi la Biashara details with confirmation-code capture
- 💬 **WhatsApp hand-off** – every order produces a prefilled WhatsApp message for +254 110 666 172
- 🧾 **Order numbers** – generated per order and saved in the browser for reference
- 📧 **Optional server backend** – Postgres + Drizzle + Nodemailer in `backend/` (saves orders and emails the café when deployed to a Node host)
- 🔒 **Validation** – same checks in the browser and on the server

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS + custom CSS |
| Fonts | Google Fonts (Poppins) + Font Awesome |
| Hosting | GitHub Pages (static export) |
| Optional backend | Next.js route handlers + PostgreSQL (Drizzle ORM) + Nodemailer |

---

## 🔧 How ordering works

The public site is a **static export**, so it runs with no server at all:

1. The customer fills the order form (all validation happens in the browser).
2. An order number (`SC-…`) is generated and the order is saved to `localStorage`.
3. A prefilled WhatsApp message is opened so the café receives the order instantly.

If you later host the app on a **Node** host (Vercel, Railway, VPS) *and* move the backend routes into `src/app/api`, the same form posts to `/api/orders` instead: the order is stored in Postgres and emailed to `ddeltaj@gmail.com`. See [`backend/README.md`](backend/README.md).

---

## 🛠️ Local Development

```bash
npm install
npm run dev          # http://localhost:3000
```

Useful commands:

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev server (Node mode, API route disabled until the backend is moved back in) |
| `npm run build:static` | Static export into `out/` |
| `npm run preview` | Serves `out/` on http://localhost:3000 |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

To reproduce the GitHub Pages build locally (site served under `/spanishcafe/`):

```bash
STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/spanishcafe NEXT_PUBLIC_ORDERS_API="" npm run build
```

---

## 🚢 Deployment

### GitHub Pages (current setup)

`.github/workflows/pages.yml` builds the static export and publishes it on every push to `main`:

- `STATIC_EXPORT=1` → `next build` emits a static site in `out/`
- `NEXT_PUBLIC_BASE_PATH=/<repo>` → assets resolve under `https://<user>.github.io/<repo>/`
- `NEXT_PUBLIC_ORDERS_API=""` → the form skips the (nonexistent) API and hands off to WhatsApp

Pages must be configured with **Source: GitHub Actions** (Settings → Pages).

### Vercel / Railway / VPS (with database + email)

1. Move `backend/api/*` to `src/app/api/`, `backend/db` to `src/db`, and `backend/lib/emailTemplate.ts` to `src/lib/` (then change the `@backend/...` imports back to `@/...`).
2. Set the environment variables below.
3. `npm run build && npm start`, or deploy through the provider's Git integration.

```env
DATABASE_URL=postgresql://user:pass@host:5432/database
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=orders@spanishcafe.co.ke
ORDER_EMAIL=ddeltaj@gmail.com
```

Then create the table with `npx drizzle-kit push --config backend/drizzle.config.json`.

---

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css         # All custom styles
│   ├── layout.tsx          # Root layout with fonts/meta
│   └── page.tsx            # Main page (all sections + order form)
└── lib/
    ├── menuItems.ts        # Menu data
    └── orderClient.ts      # Client-side validation, order numbers, WhatsApp hand-off
backend/                    # Optional Node backend (not part of the static build)
├── api/                    # /api/health and /api/orders route handlers
├── db/                     # Drizzle schema + Postgres pool
├── lib/emailTemplate.ts    # HTML order email
└── drizzle.config.json
scripts/serve-static.mjs    # Local preview server for out/
```

---

## 📋 Menu Items

| Item | Price |
|------|-------|
| Tea | KSh 20 |
| Mandazi | KSh 10 |
| Ugali | KSh 30 |
| Beans | KSh 50 |
| Sukuma Wiki | KSh 40 |
| Chapati | KSh 20 |
| Eggs | KSh 30 each |
| Kienyeji Eggs | KSh 35 each |
| Chips | KSh 50 |
| Milk (Cup) | KSh 30 |
| Milk (Litre) | KSh 50 |
| Minji Mix | KSh 60 |
| Githeri Mix | KSh 50 |
| Mala | KSh 30/cup |
| Mukimo | KSh 50 |

---

## 📞 Business Info

- **Business:** SPANISH CAFE
- **Phone/WhatsApp:** +254 110 666 172
- **Email:** ddeltaj@gmail.com
- **Payment:** M-PESA – Pochi la Biashara (0713851716)
- **Hours:** Monday–Sunday, 6:00 AM – 10:00 PM

---

© 2026 SPANISH CAFE – Serving Fresh Food Every Day ❤️
