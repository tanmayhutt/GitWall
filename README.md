# GitWall

Turn your GitHub contribution graph into a phone wallpaper.

## Features

- Generates retina-quality wallpapers from your GitHub contributions
- 11 themes — Classic, Light, Dracula, Nord, Ocean, Sunset, Mono, Catppuccin, Gruvbox, Rosé Pine, Synthwave
- Box or circular cell shapes
- **iPhone** support: iPhone 14 through 17 Pro Max (and iPhone Air)
- **Android** support: 70+ devices across Samsung, Google Pixel, OnePlus, Xiaomi, Nothing, Motorola, Sony, ASUS, OPPO, vivo, Realme, and Honor
- Shows contribution stats: total count and current streak
- iOS Shortcut-compatible URL for daily auto-updating wallpapers (iPhone)
- MacroDroid-compatible URL for daily auto-updating wallpapers (Android)
- In-memory caching with 5-minute TTL

## Setup

```bash
git clone https://github.com/govindup63/GitWall.git
cd GitWall
npm install
```

Create a `.env` file in the project root:

```
GITHUB_TOKEN=your_github_personal_access_token
```

A token with the `read:user` scope works. [Create one here](https://github.com/settings/tokens). Next.js loads `.env` automatically.

## Usage

For development:

```bash
npm run dev
```

For production:

```bash
npm run build
npm start
```

Open `http://localhost:3000`, enter a GitHub username, pick your platform (iPhone or Android), choose a theme and device, and download your wallpaper.

### API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/wallpaper?user=<username>` | Full-resolution wallpaper PNG (iPhone) |
| `GET /api/wallpaper?user=<username>&width=1440&height=3120` | Full-resolution wallpaper PNG (Android) |
| `GET /api/preview?user=<username>` | Low-res preview PNG |
| `GET /api/themes` | List available themes |
| `GET /api/devices` | List supported iPhone devices |
| `GET /api/health` | Server health check |

**Wallpaper query params:** `user` (required), `theme`, `device` (iPhone), `width` + `height` (Android), `stats` (true/false), `shape` (box/circle)

The API returns proper status codes: `400` for a missing or malformed username, `404` for a user that does not exist, `429` when GitHub rate-limits the request, and `500` for server-side issues.

### Auto-Updating Wallpaper

**iPhone (iOS Shortcuts)**
1. Generate your wallpaper and copy the Shortcut URL
2. Open iOS Shortcuts → New Shortcut
3. Add **Get Contents of URL** with the copied URL
4. Add **Set Wallpaper** using the result
5. Automate it: Automation → Time of Day → run daily

**Android (MacroDroid)**
1. Generate your wallpaper, select your phone model, and copy the MacroDroid URL
2. Install [MacroDroid](https://play.google.com/store/apps/details?id=com.arlosoft.macrodroid) from Google Play
3. Add Macro → Trigger: Date/Time → Daily at 00:01
4. Action 1: HTTP Request (GET) → save response to `/Download/gitwall.png`
5. Action 2: Device Settings → Set Wallpaper → `/Download/gitwall.png`
6. Name the macro and tap **Create Macro**

> Use the **exact same filename** in both actions.

## Tech Stack

- **Next.js** (App Router) — HTTP server and frontend
- **node-canvas** — Server-side PNG rendering
- **GitHub GraphQL API** — Contribution data

## License

ISC
