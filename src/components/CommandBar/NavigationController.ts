import { IntentObject } from './types';
import { Campaign, Channel } from '../../types';

export const executeNavigation = (
  intent: IntentObject,
  activeView: 'dashboard' | 'cosmos',
  setZoomLevel: (level: number) => void,
  setFocusedCampaign: (campaignId?: string) => void,
  campaigns: Campaign[],
  channels: Channel[]
) => {
  // Handle intents without specific targets (e.g., "show all campaigns")
  if (!intent.target) {
    // Check if it's a general navigation command
    if (intent.type === 'query') {
      // Default to showing campaign grid view
      setZoomLevel(75); // Layer 2 - Campaign Grid
      setFocusedCampaign(undefined);
      return;
    }
    return;
  }

  if (activeView === 'dashboard') {
    navigateDashboard(intent, setZoomLevel, setFocusedCampaign, campaigns, channels);
  } else if (activeView === 'cosmos') {
    navigateCosmos(intent, setFocusedCampaign, campaigns);
  }
};

// Dashboard navigation with semantic zoom
const navigateDashboard = (
  intent: IntentObject,
  setZoomLevel: (level: number) => void,
  setFocusedCampaign: (campaignId?: string) => void,
  _campaigns: Campaign[],
  _channels: Channel[]
) => {
  const { target } = intent;
  
  if (target?.entityType === 'campaign' && target.entityId) {
    // Navigate to campaign detail (Layer 3)
    setFocusedCampaign(target.entityId);
    
    // Smoothly animate to Layer 3 zoom level
    const targetZoom = 90; // Layer 3 is at 86-100%
    animateZoom(targetZoom, setZoomLevel);
    
    // Highlight after navigation
    setTimeout(() => {
      highlightElement(`campaign-${target.entityId}`);
    }, 500);
  } else if (target?.entityType === 'channel' && target.entityId) {
    // Navigate to channel view (Layer 2) and focus on specific channel
    setFocusedCampaign(undefined); // Clear any campaign focus
    const targetZoom = 75; // Layer 2 is at 70-85%
    animateZoom(targetZoom, setZoomLevel);
    
    // Highlight the channel after navigation
    setTimeout(() => {
      highlightElement(`channel-${target.entityId}`);
    }, 500);
  } else if (target?.entityType === 'channel') {
    // Navigate to channel view (Layer 2) without specific channel
    setFocusedCampaign(undefined);
    const targetZoom = 75; // Layer 2 is at 70-85%
    animateZoom(targetZoom, setZoomLevel);
  } else if (target?.entityType === 'portfolio') {
    // Navigate to portfolio view (Layer 0)
    setFocusedCampaign(undefined);
    const targetZoom = 10;
    animateZoom(targetZoom, setZoomLevel);
  }
};

// Cosmos navigation with 3D camera movement
const navigateCosmos = (
  intent: IntentObject,
  setFocusedCampaign: (campaignId?: string) => void,
  _campaigns: Campaign[]
) => {
  const { target } = intent;
  
  if (target?.entityType === 'campaign' && target.entityId) {
    // Set focused campaign which will trigger camera animation in Cosmos
    setFocusedCampaign(target.entityId);
    
    // The actual camera animation is handled by the Cosmos view
    // We just set the state here
  }
};

// Smooth zoom animation helper
const animateZoom = (targetZoom: number, setZoomLevel: (level: number) => void) => {
  // Get current zoom (we'll need to pass this as parameter or get from context)
  // For now, we'll just set it directly
  // In a production app, you'd want to animate this smoothly
  
  // Simple version:
  setZoomLevel(targetZoom);
  
  // Advanced version with animation would look like:
  /*
  const startZoom = getCurrentZoom();
  const duration = 800;
  const startTime = Date.now();
  
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    const currentZoom = startZoom + (targetZoom - startZoom) * eased;
    
    setZoomLevel(currentZoom);
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };
  
  animate();
  */
};

// Easing function
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

// Calculate which layer a target entity belongs to
export const resolveTargetLayer = (
  entityType: string,
  _campaigns: Campaign[]
): number => {
  switch (entityType) {
    case 'portfolio':
      return 10; // Layer 0
    case 'channel':
      return 75; // Layer 2
    case 'campaign':
      return 90; // Layer 3
    default:
      return 10;
  }
};

// Highlight entity after navigation (to be called from Dashboard/Cosmos)
export const highlightElement = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    // Add highlight class
    element.classList.add('command-bar-highlight');
    
    // Remove after 3 seconds
    setTimeout(() => {
      element.classList.remove('command-bar-highlight');
    }, 3000);
    
    // Scroll into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

