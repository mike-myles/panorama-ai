# Layered Intelligence Dashboard - Usage Guide

## 🚀 Quick Start

The dashboard is now running at **http://localhost:3000**

## 🎯 Key Features Implemented

### 1. **5-Layer Z-Axis Navigation System**
- **Layer 0 (0-20%)**: Portfolio Surface - Three large KPI cards with glassmorphism
- **Layer 1 (20-40%)**: Strategic Channel View - 5 channel blocks with sparklines
- **Layer 2 (40-60%)**: Campaign Grid - Campaign cards with metrics and alerts
- **Layer 3 (60-80%)**: Diagnostic Deep Dive - Full campaign analysis with charts
- **Layer 4 (80-100%)**: Granular Analytics - Detailed tables and creative performance

### 2. **Semantic Zoom Controls**
- **Mouse Control**: Hold `Ctrl` (Windows) or `Cmd` (Mac) + scroll to zoom
- **UI Controls**: Use the floating zoom widget on the bottom-right
- **Click Navigation**: Click on cards to automatically zoom to relevant layer
- **Smooth Transitions**: 800ms animated transitions between layers

### 3. **Depth-of-Field Effects**
- Progressive blur based on layer distance
- Parallax scrolling for depth perception
- Dynamic opacity adjustments
- Color desaturation for background layers

### 4. **Alert Badge System**
- **Critical Alerts**: Red pulsing badges (1s pulse)
- **Warning Alerts**: Yellow steady glow (2s pulse)
- **Info Alerts**: Blue subtle pulse (3s pulse)
- Click badges to drill down to issue location
- Badges scale based on proximity to current layer

### 5. **Quick Actions Panel**
- Slides in from right when alert is clicked
- Shows AI-powered recommendations with confidence scores
- One-click action execution with confirmation
- Action history with undo/redo support
- Impact metrics display

### 6. **Advanced Filtering**
- **Channel Filter**: Multi-select (Paid Search, Social, Display, Email, Video)
- **Date Range**: Quick presets or custom range
- **Performance Tier**: Top/Mid/Under performers
- **Status Filter**: Active/Paused/Warning
- **ROAS Range Slider**: Filter by ROAS (0-10)
- **Budget Range Slider**: Filter by budget size
- Active filters shown as removable chips

### 7. **Preset View Tabs**
- **Portfolio Health**: Layer 0 overview
- **Channel Performance**: Layer 1 sorted by performance
- **Campaign Monitor**: Layer 2 grid view
- **Issue Dashboard**: Dynamic zoom to critical issues
- **Optimization Opportunities**: Campaigns ready to scale

### 8. **Comparison Mode**
- Split-screen with independent zoom controls
- Synchronized scrolling option (toggle)
- Compare different time periods or campaigns
- Side-by-side metrics visualization

## 🎨 Visual Design Elements

### Glassmorphism Cards
- Frosted glass effect with backdrop blur
- Gradient backgrounds based on health/status
- Hover animations with lift effect
- Shimmer animation on hover

### Color System
- **Primary Blue**: #3B82F6 (Interactive elements)
- **Success Green**: #10B981 (Positive metrics)
- **Warning Amber**: #F59E0B (Caution states)
- **Critical Red**: #EF4444 (Alerts)
- **Channel-specific colors**: Blue, Purple, Orange, Green, Pink

### Animations
- Smooth zoom transitions (800ms cubic-bezier)
- Layer shift animations (600ms ease-in-out)
- Quick hover effects (200ms ease)
- Alert pulses (1-3s infinite based on severity)

## 📊 Mock Data Included

- **8 Campaigns** across 5 channels
- **30 days** of daily metrics per campaign
- **4 Active alerts** (2 critical, 1 warning, 1 info)
- **AI-powered recommendations** with confidence scores
- **Budget tracking** and spend analysis
- **Creative performance data** for selected campaigns

## 🎮 Navigation Tips

### Exploring Layers
1. Start at Layer 0 to see portfolio overview
2. Click on KPI cards to zoom into relevant areas
3. Use Ctrl/Cmd + Scroll for manual zoom control
4. Click breadcrumbs to navigate back up

### Investigating Issues
1. Look for pulsing red/yellow alert badges
2. Click badge to open Quick Actions Panel
3. Review AI recommendations
4. Execute suggested actions with one click
5. Use Undo if needed

### Filtering Data
1. Click "Filters" button to expand options
2. Select channels, status, performance tier
3. Use sliders for ROAS and budget ranges
4. Active filters appear as chips below
5. Click "Clear All" to reset

### Comparison Analysis
1. Click "Compare" button in filter bar
2. Two independent panes appear
3. Zoom each pane separately
4. Toggle "Sync Scroll" if needed
5. Click "Exit Compare" when done

## 🔧 Customization Points

### Adding New Campaigns
Edit `src/data/mockData.ts` and add campaign objects to the array.

### Modifying Colors
Update `tailwind.config.js` color definitions.

### Adjusting Zoom Ranges
Modify layer thresholds in `src/context/DashboardContext.tsx`.

### Adding New Metrics
Extend `DailyMetric` interface in `src/types/index.ts`.

## 🎯 Key Interactions to Try

1. **Zoom Through All Layers**: Start at 0%, use Ctrl+Scroll to reach 100%
2. **Alert Investigation**: Click the red alert badge on "Black Friday - Search Brand" campaign
3. **Channel Comparison**: Go to Layer 1 and compare Social vs. Paid Search performance
4. **Campaign Diagnostics**: Click "Q4 Sale - Facebook Prospecting" to see detailed charts
5. **Filter Combo**: Filter for "Active + ROAS > 4.0" to find top performers
6. **Comparison Mode**: Compare current vs. previous performance side-by-side
7. **Quick Actions**: Execute an AI recommendation and see the impact

## 📱 Responsive Behavior

- **Desktop (>1280px)**: Full experience with parallax
- **Tablet (768-1280px)**: Simplified parallax, modal overlays
- **Mobile (<768px)**: Linear navigation, swipe controls, bottom sheets

## 🚀 Performance Features

- Virtualized rendering for large datasets
- Debounced zoom calculations (60fps target)
- Memoized expensive calculations
- Progressive data loading
- GPU-accelerated CSS blur effects

## 🎓 Advanced Features

### Keyboard Shortcuts (Planned)
- `←/→`: Navigate between layers
- `Esc`: Zoom out one layer
- `Space`: Pause/resume animations
- `Cmd/Ctrl + F`: Open filters
- `Cmd/Ctrl + K`: Open command palette

### AI Playbooks (Partially Implemented)
- Multi-step optimization plans
- Predictive impact analysis
- Automated execution workflows

---

**Enjoy exploring your marketing data in 3D!** 🎉

