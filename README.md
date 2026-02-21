# Panorama

A 3D data visualization pattern for **hierarchical and connected data**: entities as nodes on orbital rings, with layout dimensions (e.g. lifecycle, time, category) mapped to rings and node size. Navigate, filter, and drill into nodes in an interactive “cosmos” view. The included demo uses campaign-style datasets to illustrate the pattern; the approach generalizes to other domain models.

**Live app:** [https://mike-myles.github.io/panorama-ai/](https://mike-myles.github.io/panorama-ai/)

---

## Features

- **Orbital 3D layout** – Nodes arranged on rings; ring position and node size encode dimensions (e.g. time, stage, magnitude). Orbit controls, zoom, and camera presets.
- **Multiple data sources & layouts** – Switch between datasets via the Database icon. Example: **Mock data** (hierarchy + lifecycle/funnel/readiness) and **GMO** (time-based: 6 rings by end date, size by duration); legend and filters adapt to the active schema.
- **Hierarchy & presets** – Preset tabs (e.g. Portfolio, Channels, Campaigns, Issues, Opportunities) for high-level navigation; filter panel and legend toggles for dimensions and subsets.
- **Node detail & relations** – Click a node to open a detail panel; optional orbit view for related nodes. Hover highlight; optional labels on nodes.
- **Panels & controls** – Alerts, launch-readiness, and timeline-style controls in the demo; (in dev) optional AI intent search via header prompt.

---

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The AI header search calls `/api/intent`, which is only available when a matching backend is run locally; the rest of the app works without it.

### Build

```bash
npm run build
```

Output is in `dist/`. For GitHub Pages deployment, the build uses `VITE_APP_BASE="/panorama-ai/"` (see `.github/workflows/deploy-pages.yml`).

### Preview production build

```bash
npm run preview
```

---

## Usage

### Data source

- Click the **Database** icon to switch between datasets. Each source can use a different layout (e.g. rings by lifecycle vs. rings by end date); the legend and filters update to match the active schema.

### Cosmos

- **Orbit / pan / zoom:** Use the 3D controls (mouse or touch) to rotate, pan, and zoom.
- **Reset view:** Use the reset control to return to the default camera.
- **Legend:** Toggles show/hide dimensions and subsets; labels and counts reflect the current data source and layout.

### Nodes

- **Click a node** to open the detail panel for that entity.
- **Hover** to highlight; optional toggle to show names on nodes.

### Presets and filters

- Use the top **Preset tabs** to switch context. Open the **Filter** panel to refine by dimensions (e.g. category, date range, status); the **legend** provides additional visibility toggles.

---

## Project structure

```
src/
├── components/
│   ├── Dashboard.tsx          # Layout: PresetTabs + CosmosView
│   ├── PresetTabs.tsx         # Header, preset tabs, data-source picker, search
│   ├── CosmosView.tsx         # 3D canvas, camera, panels, legend
│   ├── cosmos/                # Orbital viz: nodes, rings, legend, filters, detail
│   │   ├── CampaignNodes.tsx  # Node layout (supports multiple schemas)
│   │   ├── OrbitalRingSystem.tsx
│   │   ├── CosmosLegend.tsx
│   │   ├── CosmosFilterPanel.tsx
│   │   ├── CosmosDetailPanel.tsx
│   │   └── ...
│   ├── TimelineSlider.tsx
│   └── EditBudgetModal.tsx
├── context/
│   └── DashboardContext.tsx   # Data source, zoom, filters, presets
├── data/                      # Example datasets & transforms (demo uses campaign-shaped data)
│   ├── mockData3.ts
│   ├── gmoCampaigns.ts        # Transform external JSON → shared node shape
│   ├── api.campaigns.cleaned.json
│   └── ...
├── types/
│   └── index.ts
└── utils/
    ├── helpers.ts
    └── alertCalculations.ts
```

---

## Technology stack

- **React 18** + **TypeScript**
- **Vite** – build and dev server
- **Three.js** – **@react-three/fiber**, **@react-three/drei** for 3D cosmos
- **Framer Motion**, **GSAP** – UI and camera animations
- **Recharts** – 2D charts where used
- **Tailwind CSS** – styling
- **Lucide React** – icons
- **d3**, **date-fns** – layout and date handling

---

## Deployment (GitHub Pages)

- The repo is set up to deploy from **GitHub Actions** (Source: **GitHub Actions** in Settings → Pages).
- Workflow: `.github/workflows/deploy-pages.yml` – on push to `main`, runs `npm ci`, builds with `VITE_APP_BASE="/panorama-ai/"`, uploads artifact, and deploys to GitHub Pages.
- Live URL: [https://mike-myles.github.io/panorama-ai/](https://mike-myles.github.io/panorama-ai/).

---

## Browser support

- Modern evergreen browsers (Chrome, Edge, Firefox, Safari). WebGL required for the 3D view.

---

## License

MIT
