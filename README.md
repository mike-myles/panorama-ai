# Layered Intelligence Stack - Interactive Marketing Dashboard

A revolutionary "Z-Axis Data Archaeology" interface for marketing operations with semantic zooming and depth-of-field effects.

## Features

- **5-Layer System**: Navigate from portfolio overview to granular diagnostics
- **Semantic Zoom**: Natural "digging" metaphor with Ctrl/Cmd + scroll
- **Depth-of-Field Effects**: Parallax scrolling and progressive blur
- **Real-time Alerts**: Heat signatures with drill-down navigation
- **AI Recommendations**: Smart suggestions with confidence scores
- **Quick Actions**: One-click issue resolution with undo/redo
- **Advanced Filtering**: Multi-dimensional campaign filtering
- **Comparison Mode**: Side-by-side performance analysis

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build

```bash
npm run build
```

## Usage

### Navigation

- **Zoom In/Out**: Hold `Ctrl` (Windows) or `Cmd` (Mac) and scroll
- **Layer Navigation**: Click on cards to dive deeper into data
- **Preset Views**: Use top tabs to jump to specific dashboards
- **Breadcrumbs**: Click breadcrumb navigation to move up layers

### Layers

- **Layer 0 (0-20%)**: Portfolio Surface - KPI overview
- **Layer 1 (20-40%)**: Strategic Channel View - Channel performance
- **Layer 2 (40-60%)**: Tactical Campaign Grid - Campaign cards
- **Layer 3 (60-80%)**: Diagnostic Deep Dive - Charts and anomalies
- **Layer 4 (80-100%)**: Granular Analytics - Detailed tables

### Filtering

1. Click **Filters** button to expand filter options
2. Select channels, date ranges, performance tiers, and status
3. Active filters appear as removable chips
4. Click **Clear All** to reset filters

### Comparison Mode

1. Click **Compare** button in filter bar
2. Screen splits with independent zoom controls
3. Navigate each pane separately
4. Click **Exit Compare** to return

### Quick Actions

1. Click on alert badges to open Quick Actions Panel
2. Review suggested actions with confidence scores
3. Click action to see confirmation modal
4. Use Undo/Redo to reverse actions

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast builds
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Architecture

```
src/
├── components/
│   ├── layers/           # Layer-specific components
│   ├── AlertBadge.tsx    # Alert system
│   ├── Dashboard.tsx     # Main container
│   ├── FilterBar.tsx     # Filtering UI
│   ├── PresetTabs.tsx    # Top navigation
│   ├── QuickActionsPanel.tsx
│   └── ZoomControls.tsx
├── context/
│   └── DashboardContext.tsx  # State management
├── data/
│   └── mockData.ts       # Sample data
├── types/
│   └── index.ts          # TypeScript definitions
└── utils/
    └── helpers.ts        # Utility functions
```

## Performance Optimization

- Virtualized rendering for large datasets
- Debounced zoom calculations (60fps)
- Memoized expensive calculations
- Progressive data loading
- CSS-based blur effects for GPU acceleration

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Credits

Built with ❤️ for Innovation Week @ Catalyze 3D

