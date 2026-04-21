# Feature — Admin Panel

See `SNAPSHOT/06-admin-panel/` for detailed breakdown. Quick summary:

## Structure

```
/dashboard (layout with sidebar)
├── /                  — Main dashboard (stats, recent activity)
├── /analytics         — Page views, devices, countries, charts
├── /posts             — Blog post CRUD
│   ├── /new           — Create post
│   └── /[id]          — Edit post
├── /ideas             — AI idea generator
├── /gallery           — Image upload/management
├── /newsletter        — Campaigns & sending
├── /subscribers       — Newsletter subscriber list
├── /booking-links     — Booking link CRUD
├── /bookings          — Booked appointments
├── /availability      — Weekly schedule config
├── /event-pages       — Landing pages
│   └── /[id]          — Block editor
├── /knowledge         — In-app help (editable)
├── /contacts          — Contact form submissions (CRM)
│   └── /[id]          — Contact detail
├── /users             — User list (read-only)
└── /settings          — Landing + AI + Email config
```

## Additional Features

- Admin-only guard via `requireAdmin()` on every page
- Fade-in animations on content load
- Responsive (mobile drawer sidebar)
- Gold accent active state in sidebar
- Dark theme throughout
- Status badges (color-coded)
- Empty states with icons + actions
- Stat cards on dashboard with trends
