import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Cache/version gate to invalidate stale persisted camera settings
(() => {
  const APP_CACHE_VERSION = 'catalyze-cache-v2';
  try {
    const current = localStorage.getItem('app.cache.version');
    if (current !== APP_CACHE_VERSION) {
      // Remove known persisted UI keys that affect initial zoom/camera
      localStorage.removeItem('cosmos.initialCameraPosition');
      localStorage.removeItem('cosmos.initialTarget');
      localStorage.removeItem('cosmos.showCameraControls');
      // Write new version marker
      localStorage.setItem('app.cache.version', APP_CACHE_VERSION);
    }
  } catch {}
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)

