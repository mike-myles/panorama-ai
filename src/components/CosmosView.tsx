// @ts-nocheck
/* cspell:disable-file */
/* cspell:words drei gsap tgt cmp FOV fov NDC Xpx Ypx dpr lerp bg Tweens BOFU MOFU Idx */
import React, { Suspense, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useDashboard } from '../context/DashboardContext';
import { PerformanceSun } from './cosmos/PerformanceSun';
import { OrbitalRingSystem } from './cosmos/OrbitalRingSystem';
import { CampaignNodes } from './cosmos/CampaignNodes';
import { CosmosFloatingControls } from './cosmos/CosmosFloatingControls';
import { CosmosFilterPanel } from './cosmos/CosmosFilterPanel';
import { CosmosAlertsPanel } from './cosmos/CosmosAlertsPanel';
import { CosmosLaunchPanel } from './cosmos/CosmosLaunchPanel';
import { HelpModal } from './HelpModal';
import { CosmosDetailPanel } from './cosmos/CosmosDetailPanel';
import { AudienceFatigueDetailPanel } from './cosmos/panels/AudienceFatigueDetailPanel';
import { CampaignOrbitView } from './cosmos/CampaignOrbitView';
import { CommandBar } from './CommandBar';
import { ZoomControls } from './ZoomControls';
import { Campaign, FunnelStage, LifecycleStage } from '../types';
import { CosmosLegend } from './cosmos/CosmosLegend';
import { CampaignOrbitLegend } from './cosmos/CampaignOrbitLegend';
import { CosmosBackground } from './cosmos/CosmosBackground';

export const CosmosView = () => {
  const { zoomState, data, setZoomLevel, activeView, setFocusedCampaign, showZoomInDashboard, setShowZoomInDashboard } = useDashboard();
  const containerRef = useRef<HTMLDivElement>(null);
  // const [showZoomHint, setShowZoomHint] = React.useState(false); // hint disabled
  const [showCampaignNames, setShowCampaignNames] = React.useState(false); // Toggle for campaign names
  const [hoveredCampaignId, setHoveredCampaignId] = React.useState<string | null>(null); // Track hovered planet
  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(false); // Filter panel state
  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = React.useState(false); // Alerts panel state
  const [isLaunchPanelOpen, setIsLaunchPanelOpen] = React.useState(false); // Launch readiness panel state
  const [alertFilterCampaignIds, setAlertFilterCampaignIds] = React.useState<string[] | null>(null); // Alert filter for campaign IDs
  const [isHelpModalOpen, setIsHelpModalOpen] = React.useState(false); // Help modal state
  const [isCommandBarOpen, setIsCommandBarOpen] = React.useState(false);
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const isCosmosActive = activeView === 'cosmos';

  // Camera defaults and editing controls
  // Default camera tuned to fit all orbits while preserving original rotation.
  // Uses original direction [224, 68, 67] scaled ~1.5x to zoom out but keep orientation.
  const [initialCameraPosition, setInitialCameraPosition] = React.useState<[number, number, number]>([336, 102, 100.5]);
  const [initialTarget, setInitialTarget] = React.useState<[number, number, number]>([0, 0, 0]);
  const [desiredCameraPosition, setDesiredCameraPosition] = React.useState<[number, number, number]>([336, 102, 100.5]);
  const [desiredTarget, setDesiredTarget] = React.useState<[number, number, number]>([0, 0, 0]);
  // Stars: original drei implementation (no background material overrides)
  const [currentCameraPosition, setCurrentCameraPosition] = React.useState<[number, number, number]>([0, 0, 0]);
  const [currentTarget, setCurrentTarget] = React.useState<[number, number, number]>([0, 0, 0]);
  const [isCameraPanelOpen, setIsCameraPanelOpen] = React.useState(false);
  const [applyTick, setApplyTick] = React.useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [launchReadinessMode, setLaunchReadinessMode] = React.useState(false);
  const [visibleBands, setVisibleBands] = React.useState<Record<'under20' | '20to40' | '40to60' | '60to80' | 'over80', boolean>>({
    under20: true,
    '20to40': true,
    '40to60': true,
    '60to80': true,
    over80: true
  });

  // Campaign Orbit view state
  const [showCampaignOrbit, setShowCampaignOrbit] = React.useState(false);
  const [orbitFade, setOrbitFade] = React.useState(0);
  const [hideCosmos, setHideCosmos] = React.useState(false);
  const lastOrbitCampaignIdRef = useRef<string | null>(null);
  const [selectedChild, setSelectedChild] = React.useState<any | null>(null);
  const [alertGroupCampaigns, setAlertGroupCampaigns] = React.useState<Campaign[] | null>(null);
  const [selectedAlertInfo, setSelectedAlertInfo] = React.useState<import('../types').CategorizedAlert | null>(null);

  // Inline toggle component for Dashboard zoom visibility
  const ToggleDashboardZoomSetting = () => (
    <label className="inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={showZoomInDashboard}
        onChange={e => setShowZoomInDashboard(e.target.checked)}
      />
      <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-primary transition-colors relative">
        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
      </div>
    </label>
  );

  // Detail Panel State
  const [detailPanelState, setDetailPanelState] = React.useState<{
    isOpen: boolean;
    campaign: Campaign | null;
    isAnimating: boolean;
  }>({
    isOpen: false,
    campaign: null,
    isAnimating: false
  });

  // Track selected campaign ID for visual effects
  const [selectedCampaignId, setSelectedCampaignId] = React.useState<string | null>(null);
  const [selectedTargetPos, setSelectedTargetPos] = React.useState<[number, number, number] | null>(null);

  // Refs for camera animation
  const orbitControlsRef = useRef<any>(null);
  const previousCameraState = useRef<{
    position: THREE.Vector3;
    target: THREE.Vector3;
  } | null>(null);
  const isAnimatingCamera = useRef(false);
  const resetDelayUntilRef = useRef(0);
  
  // Refs for CameraController zoom sync - must be at CosmosView level to persist across re-renders
  const prevZoomLevelRef = useRef(zoomState.level);
  const pendingExternalZoomTargetRef = useRef<number | null>(null);
  const justUpdatedFromCameraRef = useRef(false);
  const applyingZoomRef = useRef(false);

  // Reset View logic (shared)
  const resetView = useCallback(() => {
    if (isAnimatingCamera.current) return; // avoid overlapping resets
    // Clear selection/panels
    setSelectedCampaignId(null);
    setSelectedTargetPos(null);
    setFocusedCampaign(undefined);
    // If an alert group is active, keep the group panel open (campaign null)
    if (alertGroupCampaigns && alertGroupCampaigns.length > 0) {
      setDetailPanelState({ isOpen: true, campaign: null, isAnimating: false });
    } else {
      setDetailPanelState({ isOpen: false, campaign: null, isAnimating: false });
    }

    const controls = orbitControlsRef.current;
    if (!controls) {
      // Fallback: snap if controls not ready
      setZoomLevel(0);
      return;
    }

    const camera = controls.object as THREE.PerspectiveCamera;
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const endPos = new THREE.Vector3(initialCameraPosition[0], initialCameraPosition[1], initialCameraPosition[2]);
    const endTarget = new THREE.Vector3(initialTarget[0], initialTarget[1], initialTarget[2]);
    const startZoom = Math.max(0, Math.min(100, zoomState.level));

    // Smooth interpolate with ease-out and temporarily disable controls
    isAnimatingCamera.current = true;
    controls.enabled = false;

    const startTime = performance.now();
    const durationMs = 1600; // Slower animation (50% reduced speed)
    let rafId = 0 as number;

    const animate = (time: number) => {
      const t = Math.min(1, (time - startTime) / durationMs);
      const ease = t * (2 - t);

      // Interpolate camera and target
      camera.position.set(
        startPos.x + (endPos.x - startPos.x) * ease,
        startPos.y + (endPos.y - startPos.y) * ease,
        startPos.z + (endPos.z - startPos.z) * ease
      );
      controls.target.set(
        startTarget.x + (endTarget.x - startTarget.x) * ease,
        startTarget.y + (endTarget.y - startTarget.y) * ease,
        startTarget.z + (endTarget.z - startTarget.z) * ease
      );
      controls.update();

      // Interpolate zoom state without fighting CameraController (it will skip while animating)
      const nextZoom = Math.round(startZoom + (0 - startZoom) * ease);
      setZoomLevel(nextZoom);

      if (t < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        // Finalize
        camera.position.copy(endPos);
        controls.target.copy(endTarget);
        controls.update();
        setZoomLevel(0);
        isAnimatingCamera.current = false;
        controls.enabled = true;
        // Give CameraController a brief grace period to avoid snap-correction
        resetDelayUntilRef.current = Date.now() + 300;
      }
    };

    rafId = requestAnimationFrame(animate);
  }, [setZoomLevel, setFocusedCampaign, initialCameraPosition, initialTarget, zoomState.level, alertGroupCampaigns]);

  // Listen for global reset requests (from ZoomControls chevrons-up)
  useEffect(() => {
    const handler = () => resetView();
    window.addEventListener('cosmosResetView', handler as EventListener);
    return () => window.removeEventListener('cosmosResetView', handler as EventListener);
  }, [resetView]);

  // Load persisted defaults (if any) - Clear old values to apply new defaults
  useEffect(() => {
    try {
      // Clear old camera position values to force new elevated default view
      localStorage.removeItem('cosmos.initialCameraPosition');
      localStorage.removeItem('cosmos.initialTarget');
      
      const savedShowCam = localStorage.getItem('cosmos.showCameraControls');
      if (savedShowCam) {
        setIsCameraPanelOpen(savedShowCam === 'true');
      }
    } catch {}
  }, []);

  // On initial mount, set camera to zoomed out position showing all 4 orbital planes
  useEffect(() => {
    // If a campaign is already focused (e.g., coming from dashboard), skip resetting the camera
    if (zoomState.focusedCampaignId) return;
    // Defer to ensure controls are instantiated
    const id = setTimeout(() => {
      if (orbitControlsRef.current) {
        // Set camera position to zoomed out view
        const camera = orbitControlsRef.current.object;
        camera.position.set(initialCameraPosition[0], initialCameraPosition[1], initialCameraPosition[2]);
        orbitControlsRef.current.target.set(initialTarget[0], initialTarget[1], initialTarget[2]);
        orbitControlsRef.current.update();
      }
    }, 100); // Small delay to ensure canvas is mounted
    return () => clearTimeout(id);
  }, [initialCameraPosition, initialTarget, zoomState.focusedCampaignId]);

  
  // NEW FRAMEWORK: Calculate tilt based on Funnel Stage (matching CampaignNodes)
  const getTiltForCampaign = useCallback((campaign: Campaign): number => {
    // Check if in launch readiness mode
    const tld = (campaign as any).targetLaunchDate ? new Date((campaign as any).targetLaunchDate) : null;
    if (launchReadinessMode && tld && !isNaN(tld.getTime())) {
      const now = new Date();
      const diffDays = Math.floor((tld.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays < 30) return 0;
      if (diffDays < 60) return (30 * Math.PI) / 180;
      return (90 * Math.PI) / 180;
    }
    // NEW FRAMEWORK: Use funnel stage to determine orbital plane angle
    const funnelStage = (campaign as any).funnelStage as FunnelStage;
    const FUNNEL_TILT_MAP: Record<FunnelStage, number> = {
      // Match CampaignNodes.tsx mapping
      'awareness': 0,                      // 0°
      'consideration': (30 * Math.PI) / 180, // 30°
      'conversion': (60 * Math.PI) / 180,    // 60°
      'retention': (90 * Math.PI) / 180      // 90°
    };
    return FUNNEL_TILT_MAP[funnelStage] || 0;
  }, [launchReadinessMode]);

  // NEW FRAMEWORK: Calculate 3D position for a campaign (matching CampaignNodes exactly)
  const getCampaignPosition = useCallback((campaign: Campaign): [number, number, number] => {
    // Use lifecycle stage for radius instead of channel
    const lifecycleStage = (campaign as any).lifecycleStage as LifecycleStage || 'active';
    const r = getRadiusForLifecycleStage(lifecycleStage);
    const a = getDistributedAngleForCampaign(campaign.id, campaign.channel);
    const tiltRadians = getTiltForCampaign(campaign);
    
    const x = Math.cos(a) * r;
    const zBase = Math.sin(a) * r;
    const y = -zBase * Math.sin(tiltRadians);
    const z = zBase * Math.cos(tiltRadians);
    
    return [x, y, z];
  }, [getTiltForCampaign]);
  
  // Soft focus handler: focus a campaign without switching panels/modes
  useEffect(() => {
    const onSoftFocus = (e: any) => {
      const id = e?.detail?.id as string | undefined;
      if (!id) return;
      const c = data.campaigns.find(cmp => cmp.id === id);
      if (!c) return;
      setSelectedCampaignId(c.id);
      const pos = getCampaignPosition(c);
      setSelectedTargetPos(pos);
    };
    window.addEventListener('cosmos:focusCampaignSoft', onSoftFocus as EventListener);
    return () => window.removeEventListener('cosmos:focusCampaignSoft', onSoftFocus as EventListener);
  }, [data.campaigns, getCampaignPosition]);

  // Sync selection when switching between views or when AI Navigator focuses a campaign
  useEffect(() => {
    if (activeView !== 'cosmos') return;
    const focusedId = zoomState.focusedCampaignId as string | undefined;
    if (focusedId) {
      // Skip if we're already focused on this campaign to prevent animation conflicts
      if (selectedCampaignId === focusedId && detailPanelState.isOpen) {
        return;
      }
      const c = data.campaigns.find(cmp => cmp.id === focusedId) || null;
      if (c) {
        // Store previous camera state before animation if panel is not already open
        if (!detailPanelState.isOpen && orbitControlsRef.current) {
          previousCameraState.current = {
            position: orbitControlsRef.current.object.position.clone(),
            target: orbitControlsRef.current.target.clone()
          };
        }
        setSelectedCampaignId(c.id);
        setDetailPanelState({ isOpen: true, campaign: c, isAnimating: false });
        // Use the full 3D position calculation matching CampaignNodes
        const pos = getCampaignPosition(c);
        setSelectedTargetPos(pos);
      }
    } else {
      setSelectedCampaignId(null);
      setDetailPanelState({ isOpen: false, campaign: null, isAnimating: false });
      setSelectedTargetPos(null);
    }
  }, [activeView, zoomState.focusedCampaignId, data.campaigns, getCampaignPosition]);

  // Listen for AI Navigator mode toggles
  useEffect(() => {
    const onSetLaunch = (e: any) => {
      const enabled = !!(e?.detail?.enabled);
      setLaunchReadinessMode(enabled);
      try { (window as any).catalyzeCosmosMode = enabled ? 'launch_readiness' : 'default'; } catch {}
      // Clear any prior selection when switching modes
      setSelectedCampaignId(null);
      setDetailPanelState({ isOpen: false, campaign: null, isAnimating: false });
      setSelectedTargetPos(null);
      // Reset band visibility on mode switch
      setVisibleBands({ under20: true, '20to40': true, '40to60': true, '60to80': true, over80: true });
    };
    const onSetDefault = () => {
      setLaunchReadinessMode(false);
      try { (window as any).catalyzeCosmosMode = 'default'; } catch {}
      setSelectedCampaignId(null);
      setDetailPanelState({ isOpen: false, campaign: null, isAnimating: false });
      setSelectedTargetPos(null);
      setVisibleBands({ under20: true, '20to40': true, '40to60': true, '60to80': true, over80: true });
    };
    window.addEventListener('cosmos:setLaunchReadiness', onSetLaunch as EventListener);
    window.addEventListener('cosmos:setDefaultView', onSetDefault as EventListener);
    return () => {
      window.removeEventListener('cosmos:setLaunchReadiness', onSetLaunch as EventListener);
      window.removeEventListener('cosmos:setDefaultView', onSetDefault as EventListener);
    };
  }, []);

  // Open group detail panel when alert filter is active
  useEffect(() => {
    if (alertFilterCampaignIds && alertFilterCampaignIds.length > 0) {
      const list = data.campaigns.filter(c => alertFilterCampaignIds.includes(c.id));
      setAlertGroupCampaigns(list);
      // Clear any single-campaign selection
      setSelectedCampaignId(null);
      setDetailPanelState({ isOpen: true, campaign: null, isAnimating: false });
    } else {
      setAlertGroupCampaigns(null);
      // Close group panel if open in group mode
      if (detailPanelState.isOpen && !detailPanelState.campaign) {
        setDetailPanelState({ isOpen: false, campaign: null, isAnimating: false });
      }
    }
  }, [alertFilterCampaignIds, data.campaigns]);

  // Handle planet click
  const handlePlanetClick = useCallback((campaign: Campaign, planetPosition: THREE.Vector3) => {

    // Store current camera state ONLY if panel is not already open
    // This ensures we return to the overview, not the previous focused planet
    if (!detailPanelState.isOpen && orbitControlsRef.current) {
      previousCameraState.current = {
        position: orbitControlsRef.current.object.position.clone(),
        target: orbitControlsRef.current.target.clone()
      };
      console.log('💾 Stored overview camera state');
    } else if (detailPanelState.isOpen) {
      console.log('🔄 Switching from', detailPanelState.campaign?.name, 'to', campaign.name);
    }

    // Set selected campaign for visual effects (10% opacity on others)
    setSelectedCampaignId(campaign.id);
    setFocusedCampaign(campaign.id);
    setSelectedTargetPos([planetPosition.x, planetPosition.y, planetPosition.z]);

    // Update detail panel with new campaign (will trigger re-animation)
    setDetailPanelState({
      isOpen: true,
      campaign,
      isAnimating: false
    });

    // OrbitControls auto-disabled by the enabled={!detailPanelState.isOpen} prop
  }, [detailPanelState.isAnimating, detailPanelState.isOpen, detailPanelState.campaign, setFocusedCampaign]);

  // Handle panel close
  const handlePanelClose = useCallback(() => {
    setDetailPanelState(prev => ({ ...prev, isAnimating: true }));

    // Clear selected campaign (restore all planets to full opacity)
    setSelectedCampaignId(null);
    // Also clear any selected child in Campaign Orbit view
    setSelectedChild(null);

    // Re-enable orbit controls
    if (orbitControlsRef.current) {
      orbitControlsRef.current.enabled = true;
    }

    // Close panel after animation
    setTimeout(() => {
      setDetailPanelState({
        isOpen: false,
        campaign: null,
        isAnimating: false
      });
      setSelectedTargetPos(null);
      setFocusedCampaign(undefined);
      previousCameraState.current = null;
    }, 800);
  }, []);

  // SIMPLE FIXED OFFSET: No complex math, just place camera at fixed relative position
  const calculateCameraTargetForPlanet = useCallback((campaign: Campaign, camera: THREE.Camera, gl: any) => {
    // Get planet's world position - use getCampaignPosition for consistency (includes tilt)
    const pos = getCampaignPosition(campaign);
    const planetWorldPos = new THREE.Vector3(pos[0], pos[1], pos[2]);
    
    console.clear();
    console.log('🎯 === SIMPLE FIXED OFFSET POSITIONING ===');
    console.log('Planet:', campaign.name);
    console.log('Planet world position:', planetWorldPos);
    
    // PROVEN APPROACH: Use screen-space math with camera FOV
    const canvas = gl.domElement;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const fov = 60; // Camera FOV in degrees
    const fovRad = (fov * Math.PI) / 180;
    
    // Target: 25% from left edge, 50% from top
    const TARGET_X = 0.25; // 25% from left
    // const TARGET_Y = 0.50; // 50% from top (not used)
    
    // For a very close zoom where sphere occupies 40% of left half:
    // Left half is 50% of screen, so 40% of that = 20% of total screen width
    // We want camera distance where planet radius appears as ~20% of screen
    const planetRadius = Math.max(0.5, Math.min(1.5, campaign.budget / 15000));
    const desiredApparentSize = 0.20; // Planet should be 20% of screen width
    
    // Calculate camera distance based on apparent size
    // apparentSize = (radius / distance) * (1 / tan(fov/2))
    // distance = radius / (apparentSize * tan(fov/2))
    const ZOOM_DISTANCE = planetRadius / (desiredApparentSize * Math.tan(fovRad / 2));
    
    // Now calculate offset for 25% screen position
    // At this distance, calculate view dimensions
    const viewHeight = 2 * Math.tan(fovRad / 2) * ZOOM_DISTANCE;
    const viewWidth = viewHeight * aspect;
    
    // Offset from screen center (0.5) to target (0.25)
    const offsetFromCenter = TARGET_X - 0.5; // -0.25 (left of center)
    const horizontalShiftAmount = offsetFromCenter * viewWidth; // Negative value
    
    // SIMPLE WORLD-SPACE OFFSET APPROACH
    // For planet to appear at 25% from left, camera needs to be offset RIGHT
    // horizontalShiftAmount is NEGATIVE (about -6), so negate it to get positive shift
    const cameraShiftRight = Math.abs(horizontalShiftAmount) * 2; // Double it for stronger effect
    
    // Place camera behind planet in world space, then shift in world X direction
    const baseCameraPos = new THREE.Vector3(
      planetWorldPos.x,
      planetWorldPos.y,
      planetWorldPos.z + ZOOM_DISTANCE
    );
    
    // Shift camera to the RIGHT (positive X) so planet appears on LEFT
    const cameraPos = baseCameraPos.clone();
    cameraPos.x += cameraShiftRight;  // Shift RIGHT in world space
    
    console.log('---');
    console.log('POSITIONING SUMMARY:');
    console.log('  Planet radius:', planetRadius.toFixed(2));
    console.log('  Zoom distance:', ZOOM_DISTANCE.toFixed(2));
    console.log('  View dimensions:', viewWidth.toFixed(2), 'x', viewHeight.toFixed(2));
    console.log('  horizontalShiftAmount:', horizontalShiftAmount.toFixed(2));
    console.log('  Camera shifted RIGHT by:', cameraShiftRight.toFixed(2), 'units (world X)');
    console.log('  Final camera position:', cameraPos);
    console.log('  Distance to planet:', cameraPos.distanceTo(planetWorldPos).toFixed(2));
    
    // Quick verification
    const tempCam = camera.clone();
    tempCam.position.copy(cameraPos);
    tempCam.lookAt(planetWorldPos);
    tempCam.updateMatrixWorld();
    
    const vector = planetWorldPos.clone();
    vector.project(tempCam);
    
    const screenX = ((vector.x + 1) / 2) * 100;
    const screenY = ((-vector.y + 1) / 2) * 100;
    
    console.log('---');
    console.log('Predicted screen position:', screenX.toFixed(1) + '%', screenY.toFixed(1) + '%');
    console.log('Target: 25% 50%');
    console.log('========================================');
    
    return {
      position: cameraPos,
      lookAt: planetWorldPos.clone(),
      distance: cameraPos.distanceTo(planetWorldPos)
    };
  }, []);

  // Track which campaign we're currently animating to, to prevent duplicate animations
  const animatingToCampaignRef = useRef<string | null>(null);

  // Camera animation controller - Handles both initial zoom and planet-to-planet transitions
  const CameraAnimationController = () => {
    const { camera, gl } = useThree();

    useEffect(() => {
      if (detailPanelState.isOpen && detailPanelState.campaign) {
        // CRITICAL: Prevent duplicate/conflicting animations to the same campaign
        if (animatingToCampaignRef.current === detailPanelState.campaign.id) {
          console.log('⏭️ Skipping duplicate animation to:', detailPanelState.campaign.name);
          return;
        }
        
        // Kill any existing animations first
        gsap.killTweensOf(camera.position);
        gsap.killTweensOf(camera.rotation);
        
        // Mark that we're animating to this specific campaign
        animatingToCampaignRef.current = detailPanelState.campaign.id;
        isAnimatingCamera.current = true;

        console.log('🚀 Animating camera to:', detailPanelState.campaign.name);
        console.log('✋ OrbitControls auto-disabled by enabled prop');

        // Calculate target camera position using ITERATIVE trial-and-error
        const target = calculateCameraTargetForPlanet(detailPanelState.campaign, camera, gl);
        const targetCamPos = target.position.clone();
        const currentControlsTarget = orbitControlsRef.current ? orbitControlsRef.current.target.clone() : new THREE.Vector3(0, 0, 0);

        // Store initial position (not used)
        // const startPos = camera.position.clone();

        // Kill ALL existing animations
        gsap.killTweensOf(camera.position);
        gsap.killTweensOf(camera.rotation);

        // Animate ONLY camera position
        gsap.to(camera.position, {
          x: targetCamPos.x,
          y: targetCamPos.y,
          z: targetCamPos.z,
          duration: 2.0, // Slower animation (50% reduced speed)
          ease: 'power3.out',
          onStart: () => {
            console.log('🎬 Animation starting...');
            // Preserve current viewing orientation (no reorientation to planet)
            camera.lookAt(currentControlsTarget);
          },
          onUpdate: () => {
            // Keep existing orientation (no plane flattening)
            camera.lookAt(currentControlsTarget);
            camera.updateProjectionMatrix();
          },
          onComplete: () => {
            console.log('✅ Animation done');
            
            // Lock camera position EXACTLY
            camera.position.set(targetCamPos.x, targetCamPos.y, targetCamPos.z);
            camera.lookAt(currentControlsTarget);
            camera.updateProjectionMatrix();
            
            // KEEP OrbitControls DISABLED - DO NOT call update()!
            // Calling update() causes them to recalculate and fight with locked position
            // Do not modify controls target; preserve tilt
            
            isAnimatingCamera.current = false;
            // Keep animatingToCampaignRef set to prevent re-triggers while panel is open
            setDetailPanelState(prev => ({ ...prev, isAnimating: false }));
            
            // VERIFICATION: Check actual screen position
            setTimeout(() => {
              console.log('📊 === SCREEN POSITION VERIFICATION ===');
              
              // Project planet position to screen space
              const vector = currentControlsTarget.clone();
              vector.project(camera);
              
              // Convert from NDC (-1 to 1) to screen coordinates (0 to 1)
              const screenX = (vector.x + 1) / 2;
              const screenY = (-vector.y + 1) / 2;
              
              // Convert to pixels
              const screenXpx = screenX * gl.domElement.clientWidth;
              const screenYpx = screenY * gl.domElement.clientHeight;
              
              const targetX = 0.25;
              const targetY = 0.50;
              
              const errorX = Math.abs(screenX - targetX) * 100;
              const errorY = Math.abs(screenY - targetY) * 100;
              
              console.log('Planet screen position:');
              console.log('  X:', (screenX * 100).toFixed(1) + '%', '(' + screenXpx.toFixed(0) + 'px)');
              console.log('  Y:', (screenY * 100).toFixed(1) + '%', '(' + screenYpx.toFixed(0) + 'px)');
              console.log('---');
              console.log('Target position: 25% 50%');
              console.log('Error:');
              console.log('  X:', errorX.toFixed(2) + '%');
              console.log('  Y:', errorY.toFixed(2) + '%');
              console.log('---');
              
              const isCorrect = errorX < 5 && errorY < 5; // Within 5%
              
              if (screenX > 0.5) {
                console.error('❌ POSITION WRONG: Planet is on RIGHT side of screen!');
              } else if (errorX > 10) {
                console.error('❌ HORIZONTAL ERROR TOO LARGE:', errorX.toFixed(1) + '%');
              } else if (errorY > 10) {
                console.error('❌ VERTICAL ERROR TOO LARGE:', errorY.toFixed(1) + '%');
              } else if (isCorrect) {
                console.log('✅ POSITION CORRECT: Planet at center of left half!');
              } else {
                console.warn('⚠️ POSITION CLOSE but not perfect (within 10%)');
              }
              
              console.log('---');
              console.log('Camera distance:', camera.position.distanceTo(planetWorldPos).toFixed(2));
              console.log('Controls enabled:', orbitControlsRef.current?.enabled);
              console.log('======================================');
            }, 100);
          }
        });
        
      } else if (!detailPanelState.isOpen && previousCameraState.current && !isAnimatingCamera.current) {
        // Clear the animation lock when panel closes
        animatingToCampaignRef.current = null;
        
        // Animate back to previous position
        isAnimatingCamera.current = true;
        const prevState = previousCameraState.current;

        console.log('🔙 Animating back to previous position...');
        console.log('✋ OrbitControls auto-enabled by enabled prop');

        // Kill any existing animations
        gsap.killTweensOf(camera.position);

        gsap.to(camera.position, {
          x: prevState.position.x,
          y: prevState.position.y,
          z: prevState.position.z,
          duration: 1.6, // Slower animation (50% reduced speed)
          ease: 'power2.inOut',
          onUpdate: () => {
            camera.updateProjectionMatrix();
          },
          onComplete: () => {
            // OrbitControls auto-enabled by prop - just update target
            if (orbitControlsRef.current) {
              orbitControlsRef.current.target.copy(prevState.target);
            }
            
            isAnimatingCamera.current = false;
            console.log('✅ Return animation complete');
          }
        });
      }
    }, [detailPanelState.isOpen, detailPanelState.campaign, selectedCampaignId, camera, gl, calculateCameraTargetForPlanet]);

    return null;
  };

  // Camera focus controller – preserves orbital plane by moving camera and target together
  const CameraFocusController = ({ targetPosition, controlsRef, onComplete }: { targetPosition: [number, number, number] | null; controlsRef: React.RefObject<any>; onComplete?: () => void; }) => {
    const { camera } = useThree();
    const animationRef = useRef<number>(0);
    const isAnimatingRef = useRef(false);

    useEffect(() => {
      if (!targetPosition) {
        // Clear animation state when no target
        if (isAnimatingRef.current) {
          isAnimatingRef.current = false;
          isAnimatingCamera.current = false;
        }
        return;
      }

      // Prevent duplicate animations to same position
      if (isAnimatingRef.current) {
        console.log('⏭️ Skipping duplicate focus animation');
        return;
      }

      // CRITICAL: Set animation flag to prevent CameraController interference
      isAnimatingCamera.current = true;
      isAnimatingRef.current = true;

      // Disable controls during focus to avoid drift/rotation
      const controls = controlsRef.current;
      if (controls) controls.enabled = false;

      const startPos = camera.position.clone();
      const startTarget = controlsRef.current?.target ? controlsRef.current.target.clone() : new THREE.Vector3();
      const endTarget = new THREE.Vector3(targetPosition[0], targetPosition[1], targetPosition[2]);

      const direction = startPos.clone().sub(endTarget).normalize();
      const desiredDistance = 30;
      const desiredElevation = 15;
      const endPos = endTarget
        .clone()
        .add(direction.multiplyScalar(desiredDistance))
        .add(new THREE.Vector3(0, desiredElevation, 0));

      const startTime = performance.now();
      const durationMs = 1300; // Slower zoom animation (50% reduced speed)

      const animate = (time: number) => {
        const t = Math.min(1, (time - startTime) / durationMs);
        const ease = t * (2 - t);

        const newPos = startPos.clone().lerp(endPos, ease);
        const newTarget = startTarget.clone().lerp(endTarget, ease);

        camera.position.copy(newPos);
        if (controlsRef.current) {
          controlsRef.current.target.copy(newTarget);
          // Keep OrbitControls internal state in sync to avoid end-of-animation snap
          controlsRef.current.update();
        }

        if (t < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete - clear flags
          isAnimatingRef.current = false;
          isAnimatingCamera.current = false;
          // Final sync to ensure no last-frame jump
          if (controlsRef.current) {
            controlsRef.current.update();
          }
          // Signal completion so parent can clear the target and return full control
          onComplete && onComplete();
        }
      };

      animationRef.current = requestAnimationFrame(animate);
      return () => {
        cancelAnimationFrame(animationRef.current);
        isAnimatingRef.current = false;
        isAnimatingCamera.current = false;
        // Re-enable controls after animation completes
        const reEnable = () => {
          if (controlsRef.current) controlsRef.current.enabled = true;
        };
        setTimeout(reEnable, 0);
      };
    }, [targetPosition, controlsRef, camera, onComplete]);

    return null;
  };

  // NEW FRAMEWORK: Helper functions for positioning based on lifecycle stage
  const getRadiusForLifecycleStage = (lifecycleStage: LifecycleStage): number => {
    // Match radii used in CampaignNodes.tsx (LIFECYCLE_RADIUS_MAP)
    const radii: Record<LifecycleStage, number> = {
      'closing': 62,
      'active': 80,
      'launching': 98,
      'qa_ready': 116,
      'development': 134,
      'planning': 152,
      'ideation': 170
    };
    return radii[lifecycleStage] || 64;
  };
  
  // Legacy helper (kept for backward compatibility)
  const getRadiusForChannel = (channel: string): number => {
    const radii: Record<string, number> = {
      'search': 40,
      'social': 52,
      'display': 64,
      'email': 76,
      'video': 88
    };
    return radii[channel] || 64;
  };

  const getCampaignAngle = (campaignId: string): number => {
    const seed = campaignId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const angle1 = (seed % 1000) / 1000;
    const angle2 = ((seed * 7) % 1000) / 1000;
    const angle3 = ((seed * 13) % 1000) / 1000;
    const randomValue = (angle1 + angle2 + angle3) / 3;
    return randomValue * Math.PI * 2;
  };

  // Deterministic hash function matching CampaignNodes exactly
  const hash01 = (s: string): number => {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return (h % 100000) / 100000;
  };

  // Must match CampaignNodes' calculatedAngle calculation exactly
  const getDistributedAngleForCampaign = (campaignId: string, channel: string): number => {
    // Match CampaignNodes default distribution (even spacing per ring with axis avoidance)
    const target = data.campaigns.find(c => c.id === campaignId);
    if (!target) return 0;
    const lifecycleStage = (target as any).lifecycleStage as LifecycleStage || 'active';
    const ringRadius = getRadiusForLifecycleStage(lifecycleStage);
    const sameRing = data.campaigns
      .filter(c => {
        const ls = (c as any).lifecycleStage as LifecycleStage || 'active';
        return getRadiusForLifecycleStage(ls) === ringRadius;
      })
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const n = sameRing.length;
    if (n === 0) return 0;
    const index = sameRing.findIndex(c => c.id === campaignId);
    if (index === -1) return 0;
    const step = (Math.PI * 2) / n;
    const forbidden = (5 * Math.PI) / 180; // 5°
    const seedBase = hash01('ring:' + String(ringRadius) + ':base') * (Math.PI * 2);
    const allIdx: number[] = sameRing.map((_, i) => i);
    const wrap = (a: number) => {
      let t = a % (Math.PI * 2);
      return t < 0 ? t + Math.PI * 2 : t;
    };
    const distTo = (a: number, center: number) => {
      const d = Math.abs(wrap(a) - center);
      return Math.min(d, Math.PI * 2 - d);
    };
    let bestBase = seedBase;
    let bestScore = -Infinity;
    for (let k = 0; k < 16; k++) {
      const candidate = wrap(seedBase + k * (step / 7));
      let score = Infinity;
      for (const i of allIdx) {
        const a = wrap(candidate + i * step);
        const s = Math.min(distTo(a, 0), distTo(a, Math.PI));
        score = Math.min(score, s);
      }
      if (score > bestScore) {
        bestScore = score;
        bestBase = candidate;
      }
      if (score >= forbidden + 0.01) break; // good enough
    }
    let angle = (bestBase + index * step) % (Math.PI * 2);
    if (angle < 0) angle += Math.PI * 2;
    // Final safeguard: push away from axes if still within forbidden zone
    const d0 = distTo(angle, 0);
    const dPi = distTo(angle, Math.PI);
    if (Math.min(d0, dPi) < forbidden) {
      const center = d0 <= dPi ? 0 : Math.PI;
      angle = wrap(center + (wrap(angle) < center ? -forbidden : forbidden));
    }
    // Explicit overrides to spread specific alert campaigns farther apart (must match CampaignNodes)
    const overrides: Record<string, number> = {
      'alert-audience-retarget-1': Math.PI / 6,       // 30°
      'alert-audience-retarget-2': (5 * Math.PI) / 6, // 150°
      'alert-audience-retarget-3': (3 * Math.PI) / 2  // 270°
    };
    if (overrides.hasOwnProperty(campaignId)) {
      return overrides[campaignId];
    }
    return angle;
  };

  // Camera sync - reads OrbitControls distance for display only
  // Note: refs (prevZoomLevelRef, pendingExternalZoomTargetRef, etc.) are defined at CosmosView level
  // to persist across re-renders and properly detect zoom changes from UI buttons
  const CameraController = () => {
    const { camera } = useThree();
    const lastDisplayUpdate = useRef(0);
    
    useFrame(() => {
      if (!isCosmosActive) return;
      
      // Ensure controls are enabled for interaction, but do NOT override during animations or panel open
      if (
        orbitControlsRef.current &&
        !orbitControlsRef.current.enabled &&
        !detailPanelState.isOpen &&
        !isAnimatingCamera.current
      ) {
        orbitControlsRef.current.enabled = true;
      }
      
      // Skip all camera position/zoom updates during animations OR when detail panel is open
      // This prevents the zoom reconciliation logic from fighting with GSAP animations
      if (isAnimatingCamera.current || detailPanelState.isOpen) {
        // Clear any pending zoom target to prevent conflicts when panel closes
        pendingExternalZoomTargetRef.current = null;
        return;
      }

      // If we're within the grace period after a reset, sync prevZoom and skip to avoid snap
      if (resetDelayUntilRef.current) {
        const nowTs = Date.now();
        if (nowTs < resetDelayUntilRef.current) {
          prevZoomLevelRef.current = zoomState.level;
          return;
        } else {
          resetDelayUntilRef.current = 0;
        }
      }
      
      // Track latest zoom level (display only). Do not auto-move camera unless explicitly set elsewhere.
      const zoomChanged = zoomState.level !== prevZoomLevelRef.current;
      prevZoomLevelRef.current = zoomState.level;
      justUpdatedFromCameraRef.current = false;
      
      // Calculate actual distance from center (target) for display only
      const target = orbitControlsRef.current ? orbitControlsRef.current.target : new THREE.Vector3(0, 0, 0);
      const toCam = camera.position.clone().sub(target);
      const currentDistance = toCam.length();

      // Continue easing toward any pending external zoom target (must be set explicitly by UI handlers)
      if (pendingExternalZoomTargetRef.current !== null) {
        const targetDist = pendingExternalZoomTargetRef.current;
        const delta = targetDist - currentDistance;
        if (Math.abs(delta) > 0.25) {
          applyingZoomRef.current = true;
          const dir = toCam.length() > 0.0001 ? toCam.normalize() : new THREE.Vector3(0, 0, 1);
          const nextDist = currentDistance + delta * 0.35;
          const newPos = target.clone().add(dir.multiplyScalar(nextDist));
          camera.position.copy(newPos);
          camera.updateProjectionMatrix();
          if (orbitControlsRef.current) {
            orbitControlsRef.current.update();
          }
        } else {
          applyingZoomRef.current = false;
          pendingExternalZoomTargetRef.current = null;
        }
      }

      // Throttled display/state sync
      const now = Date.now();
      if (now - lastDisplayUpdate.current < 150) return; // Throttle moderately

      // Expose current camera and target for UI readout
      setCurrentCameraPosition([camera.position.x, camera.position.y, camera.position.z]);
      if (orbitControlsRef.current) {
        const t = orbitControlsRef.current.target;
        setCurrentTarget([t.x, t.y, t.z]);
      }

      // Do not back-propagate camera distance to zoom state automatically; only user input should update it.
    });
    
    return null;
  };

  // Apply controller - applies desired camera/target when applyTick changes
  const CameraApplyController = ({ tick, pos, tgt }: { tick: number; pos: [number, number, number]; tgt: [number, number, number]; }) => {
    const { camera } = useThree();
    useEffect(() => {
      if (!isCosmosActive) return;
      if (detailPanelState.isOpen || isAnimatingCamera.current) return;
      // Apply camera position
      camera.position.set(pos[0], pos[1], pos[2]);
      camera.updateProjectionMatrix();
      // Apply controls target
      if (orbitControlsRef.current) {
        orbitControlsRef.current.target.set(tgt[0], tgt[1], tgt[2]);
        orbitControlsRef.current.update();
      }
    }, [tick]);
    return null;
  };

  // Stable campaign context for Campaign Orbit overlay independent of panel open state
  const orbitCampaign = React.useMemo(() => {
    if (!showCampaignOrbit) return null;
    const id = lastOrbitCampaignIdRef.current || selectedCampaignId || detailPanelState.campaign?.id || null;
    if (!id) return null;
    return data.campaigns.find(c => c.id === id) || null;
  }, [showCampaignOrbit, selectedCampaignId, detailPanelState.campaign, data.campaigns]);

  // Camera Position Logger Component - Click camera button to log current camera position
  const CameraPositionLogger = () => {
    const { camera } = useThree();
    
    React.useEffect(() => {
      const logPosition = () => {
        const pos = camera.position;
        const target = orbitControlsRef.current?.target || new THREE.Vector3();
        
        console.log('%c═══════════════════════════════════════════', 'color: #00ff00; font-weight: bold');
        console.log('%c🎥 CURRENT CAMERA POSITION', 'color: #00ff00; font-size: 16px; font-weight: bold');
        console.log('%c═══════════════════════════════════════════', 'color: #00ff00; font-weight: bold');
        console.log('%cCamera Position (for CosmosView.tsx):', 'color: #ffff00; font-weight: bold');
        console.log(`  [${Math.round(pos.x)}, ${Math.round(pos.y)}, ${Math.round(pos.z)}]`);
        console.log('%cCamera Target:', 'color: #ffff00; font-weight: bold');
        console.log(`  [${Math.round(target.x)}, ${Math.round(target.y)}, ${Math.round(target.z)}]`);
        console.log('%cTo use: Copy the position array above and paste it into:', 'color: #00ffff');
        console.log('  src/components/CosmosView.tsx');
        console.log('  Lines 42-44 (initialCameraPosition and desiredCameraPosition)');
        console.log('  Line 989 (Canvas camera position)');
        console.log('%c═══════════════════════════════════════════', 'color: #00ff00; font-weight: bold');
      };
      
      const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'p' || e.key === 'P') {
          logPosition();
        }
      };
      
      const handleButtonClick = () => {
        logPosition();
      };
      
      window.addEventListener('keydown', handleKeyPress);
      window.addEventListener('logCameraPosition', handleButtonClick);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
        window.removeEventListener('logCameraPosition', handleButtonClick);
      };
    }, [camera]);
    
    return null;
  };

  // Legend state for filtering
  const [visibleChannels, setVisibleChannels] = React.useState<Record<string, boolean>>({});
  const [visibleStatuses, setVisibleStatuses] = React.useState<Record<'active' | 'at_risk' | 'paused', boolean>>({ active: true, at_risk: true, paused: true });
  const [alertsOnly, setAlertsOnly] = React.useState(false);
  const [launchOnly, setLaunchOnly] = React.useState(false);
  const [visibleTiers, setVisibleTiers] = React.useState<Record<'flat' | 'thirty' | 'sixty' | 'ninety', boolean>>({ flat: true, thirty: true, sixty: true, ninety: true });
  
  // NEW FRAMEWORK: Lifecycle stage visibility (ring order from sun)
  const [visibleLifecycleStages, setVisibleLifecycleStages] = React.useState<Record<LifecycleStage, boolean>>({
    ideation: true,
    planning: true,
    development: true,
    qa_ready: true,
    launching: true,
    active: true,
    closing: true
  });
  
  // NEW FRAMEWORK: Funnel stage visibility (orbital plane angles)
  const [visibleFunnelStages, setVisibleFunnelStages] = React.useState<Record<FunnelStage, boolean>>({
    awareness: true,
    consideration: true,
    conversion: true,
    retention: true
  });
  
  // NEW FRAMEWORK: Readiness status visibility (planet colors)
  const [visibleReadinessStatuses, setVisibleReadinessStatuses] = React.useState<Record<'on_track' | 'needs_attention' | 'at_risk', boolean>>({
    on_track: true,
    needs_attention: true,
    at_risk: true
  });
  
  // Spend size visibility (for legend filtering)
  const [visibleSpendSizes, setVisibleSpendSizes] = React.useState<Record<'high' | 'mid' | 'low', boolean>>({
    high: true,
    mid: true,
    low: true
  });

  // Ensure only one left-side panel is open at a time (single-select behavior)
  const openExclusivePanel = React.useCallback((panel: 'ai' | 'search' | 'alerts' | 'launch' | 'none') => {
    setIsCommandBarOpen(panel === 'ai');
    setIsSearchOpen(panel === 'search');
    setIsAlertsPanelOpen(panel === 'alerts');
    setIsLaunchPanelOpen(panel === 'launch');
    setLaunchOnly(panel === 'launch');
  }, []);

  const handleToggleChannel = (id: string) => {
    setVisibleChannels(prev => ({ ...prev, [id]: !(prev[id] !== false) }));
  };
  const handleToggleStatus = (s: 'active' | 'at_risk' | 'paused') => {
    setVisibleStatuses(prev => ({ ...prev, [s]: !prev[s] }));
  };
  const handleToggleAlertsOnly = () => setAlertsOnly(v => !v);
  const handleToggleTier = (t: 'flat' | 'thirty' | 'sixty' | 'ninety') => setVisibleTiers(prev => ({ ...prev, [t]: !prev[t] }));
  
  // NEW FRAMEWORK: Toggle handlers
  const handleToggleLifecycleStage = (stage: LifecycleStage) => {
    setVisibleLifecycleStages(prev => ({ ...prev, [stage]: !prev[stage] }));
  };
  const handleToggleFunnelStage = (stage: FunnelStage) => {
    setVisibleFunnelStages(prev => ({ ...prev, [stage]: !prev[stage] }));
  };
  const handleToggleReadinessStatus = (status: 'on_track' | 'needs_attention' | 'at_risk') => {
    setVisibleReadinessStatuses(prev => ({ ...prev, [status]: !prev[status] }));
  };

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative bg-[#0a0a0c]"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Top-centered title overlay - floating text */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none">
        <div className="text-sm font-semibold text-white/90">
          {showCampaignOrbit ? 'Campaign orbit' : (launchReadinessMode ? 'Launch readiness' : 'Portfolio overview')}
        </div>
      </div>

      {!hideCosmos && (
        <div className="absolute inset-0 z-10" style={{ opacity: showCampaignOrbit ? (1 - orbitFade) : 1, transition: 'opacity 180ms linear' }}>
          <Canvas
        camera={{
          position: [336, 102, 100.5], // Fit all orbits, preserve original rotation
          fov: 60,
          near: 5,
          far: 3000
        }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 2]}
        style={{ pointerEvents: showCampaignOrbit ? 'none' : 'auto', touchAction: 'none', width: '100%', height: '100%' }}
        onPointerMissed={() => console.log('Canvas: Pointer missed (clicked on empty space)')}
        onPointerDown={() => {
          if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = true;
          }
        }}
      >
        {/* Subtle dark blue gradient background for visual consistency with Dashboard */}
        <CosmosBackground />
        
        {/* Camera controllers */}
        <CameraController />
        <CameraPositionLogger />
        {false && <CameraAnimationController />}
        {false && <CameraApplyController tick={applyTick} pos={desiredCameraPosition} tgt={desiredTarget} />}
        
        {/* Lighting (physically based) */}
        <ambientLight intensity={0.2} />
        <hemisphereLight intensity={0.25} groundColor={"#1a1a1a"} color={"#ffffff"} />
        <directionalLight position={[120, 140, 100]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-80, 40, -60]} intensity={0.6} color="#ffffff" />
        <directionalLight position={[0, 180, 0]} intensity={0.4} color="#ffffff" />
        {/* Central sun light */}
        <pointLight position={[0, 0, 0]} intensity={1.2} color="#ffd700" />
        <pointLight position={[50, 50, 50]} intensity={0.5} color="#4a90e2" />
        <pointLight position={[-50, 20, -50]} intensity={0.3} color="#ffffff" />
        {/* Soft environment reflections */}
        <Environment preset="city" intensity={0.6} />
        
        {/* Star Field Background (original parameters) */}
        <Suspense fallback={null}>
          <Stars 
            radius={300} 
            depth={150} 
            count={5000} 
            factor={4} 
            saturation={0.5} 
            fade 
          />
        </Suspense>
        
        {/* Central Performance Sun - Dims when campaign selected */}
        <PerformanceSun 
          portfolioData={data.portfolio} 
          visible={true}
          dimmed={detailPanelState.isOpen}
          showLabel={showCampaignNames}
          labelText={launchReadinessMode ? 'Next 90 days' : undefined}
        />
        
        {/* Orbital Ring System - NEW FRAMEWORK: Lifecycle rings + Funnel planes */}
        <OrbitalRingSystem 
          channels={data.channels}
          campaigns={launchReadinessMode ? data.campaigns.filter(c => {
            const tld = (c as any).targetLaunchDate ? new Date((c as any).targetLaunchDate) : null;
            if (c.launchDate) return false;
            if (!tld || isNaN(tld.getTime())) return false;
            const now = new Date();
            const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
            return tld.getTime() >= now.getTime() && tld.getTime() <= in90.getTime();
          }) : data.campaigns}
          zoomLevel={zoomState.level}
          visibleChannels={visibleChannels}
          visibleTiers={visibleTiers}
          visibleLifecycleStages={visibleLifecycleStages}
          visibleFunnelStages={visibleFunnelStages}
          layoutMode={launchReadinessMode ? 'launch_readiness' : 'default'}
          visibleBands={visibleBands}
        />
        
        {/* Campaign Nodes - NEW FRAMEWORK: Lifecycle rings + Funnel planes + Readiness colors */}
        <CampaignNodes 
          campaigns={launchReadinessMode ? data.campaigns.filter(c => {
            const tld = (c as any).targetLaunchDate ? new Date((c as any).targetLaunchDate) : null;
            if (c.launchDate) return false;
            if (!tld || isNaN(tld.getTime())) return false;
            const now = new Date();
            const in90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
            return tld.getTime() >= now.getTime() && tld.getTime() <= in90.getTime();
          }) : data.campaigns}
          zoomLevel={zoomState.level}
          hoveredCampaignId={hoveredCampaignId}
          setHoveredCampaignId={setHoveredCampaignId}
          showCampaignNames={showCampaignNames}
          onCampaignClick={handlePlanetClick}
          isDetailPanelOpen={detailPanelState.isOpen}
          selectedCampaignId={selectedCampaignId}
          alertsViewActive={isAlertsPanelOpen}
          filterQuery={searchQuery}
          // visibility controls
          visibleChannels={visibleChannels}
          visibleStatuses={visibleStatuses}
          alertsOnly={alertsOnly}
          launchOnly={launchOnly}
          visibleTiers={visibleTiers}
          // NEW FRAMEWORK: visibility controls
          visibleLifecycleStages={visibleLifecycleStages}
          visibleFunnelStages={visibleFunnelStages}
          visibleReadinessStatuses={visibleReadinessStatuses}
          visibleSpendSizes={visibleSpendSizes}
          layoutMode={launchReadinessMode ? 'launch_readiness' : 'default'}
          alertFilterCampaignIds={alertFilterCampaignIds}
        />
        
        {/* OrbitControls - ALWAYS ENABLED for background interaction */}
        <OrbitControls 
          ref={orbitControlsRef}
          enabled={true}
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
          enableDamping={false}
          dampingFactor={0}
          rotateSpeed={0.5}
          zoomSpeed={0.35}
          zoomToCursor={false}
          minDistance={5}
          maxDistance={800}
          maxPolarAngle={Math.PI - 0.001}
          minPolarAngle={0.001}
          screenSpacePanning={false}
          mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
          touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
          makeDefault
        />
        {/* Focus controller to move camera toward selected planet without flattening plane - ensure controls are mounted first */}
        <CameraFocusController 
          targetPosition={selectedTargetPos}
          controlsRef={orbitControlsRef}
          onComplete={() => {
            // Clear the focus target so we don't keep snapping to the node
            setSelectedTargetPos(null);
            // Prevent residual zoom easing/drift after animation
            pendingExternalZoomTargetRef.current = null;
            applyingZoomRef.current = false;
            prevZoomLevelRef.current = zoomState.level;
          }}
        />
          </Canvas>
        </div>
      )}

      {/* Campaign Orbit View overlay - fades in over canvas */}
      {showCampaignOrbit && (
        <div className="absolute inset-0 z-30" style={{ opacity: orbitFade }}>
          {/* Background gradient - dark cosmic theme with black, deep blue, and purple */}
          <div 
            className="absolute inset-0" 
            style={{ 
              background: 'linear-gradient(135deg, #0a0a0f 0%, #0d1117 25%, #111827 50%, #1a1033 75%, #0f0a1a 100%)' 
            }} 
          />
          <Canvas
            camera={{ position: [0, 140, 120], fov: 48, near: 1, far: 3000 }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
            style={{ pointerEvents: 'auto' }}
          >
            <CosmosBackground />
            {/* Starfield similar to Cosmos view but slightly less dense (original parameters) */}
            <Suspense fallback={null}>
              <Stars 
                radius={360} 
                depth={180} 
                count={3500} 
                factor={4} 
                saturation={0.1} 
                fade 
                speed={0.5}
              />
            </Suspense>
            {/* Overlay lighting (physically based) */}
            <ambientLight intensity={0.2} />
            <hemisphereLight intensity={0.25} groundColor={"#1a1a1a"} color={"#ffffff"} />
            <directionalLight position={[120, 140, 100]} intensity={1.1} color="#ffffff" />
            <directionalLight position={[-80, 40, -60]} intensity={0.5} color="#ffffff" />
            <directionalLight position={[0, 180, 0]} intensity={0.35} color="#ffffff" />
            <pointLight position={[0, 0, 0]} intensity={1.2} color="#ffd700" />
            <Environment preset="city" intensity={0.55} />
            <CampaignOrbitView 
              campaign={orbitCampaign} 
              opacity={orbitFade} 
              sceneScale={1}
              selectedChild={selectedChild}
              filterQuery={searchQuery}
              onSelect={(payload: any) => {
                // Always open detail panel and set campaign context (even if previously closed)
                let openCampaign = detailPanelState.campaign;
                if (!openCampaign) {
                  const campaignId = lastOrbitCampaignIdRef.current || selectedCampaignId || null;
                  if (campaignId) {
                    const c = data.campaigns.find(cc => cc.id === campaignId) || null;
                    if (c) openCampaign = c as Campaign;
                  }
                }
                setDetailPanelState({ isOpen: true, campaign: openCampaign || detailPanelState.campaign, isAnimating: false });
                // Select the clicked child/item
                setSelectedChild(payload);
              }}
            />
            {/* Orbit controls for Campaign Orbit view */}
            <OrbitControls 
              enabled={true}
              enableZoom={true}
              enablePan={false}
              enableRotate={true}
              enableDamping={false}
              dampingFactor={0}
              rotateSpeed={0.5}
              zoomSpeed={0.35}
              zoomToCursor={false}
              minDistance={90}
              maxDistance={400}
              makeDefault
            />
          </Canvas>
        </div>
      )}

      {/* Bottom-center CTA to return to Cosmos when in Campaign Orbit */}
      {showCampaignOrbit && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-40"
          style={{ bottom: (() => {
            const el = document.getElementById('zoom-bar');
            if (!el) return '96px';
            const rect = el.getBoundingClientRect();
            const viewportH = window.innerHeight || document.documentElement.clientHeight;
            const distanceFromBottom = Math.max(0, viewportH - rect.bottom);
            return `${distanceFromBottom + 8}px`;
          })() }}
        >
          <button
            className="px-5 py-3 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-white font-semibold shadow-xl backdrop-blur-lg"
            onClick={() => {
              // Reverse transition: reveal Cosmos, fade out Orbit overlay, keep selection to re-center
              setHideCosmos(false);
              const start = performance.now();
              const duration = 1400; // Slower animation (50% reduced speed)
              const startLevel = zoomState.level;
              const endLevel = Math.max(0, startLevel - 10); // slight zoom-out for effect
              const step = () => {
                const now = performance.now();
                const t = Math.min(1, (now - start) / duration);
                const ease = t * (2 - t);
                const fade = 1 - ease; // orbit fades out from 1 -> 0
                setOrbitFade(fade);
                const z = Math.round(startLevel + (endLevel - startLevel) * ease);
                setZoomLevel(z);
                if (t < 1) {
                  requestAnimationFrame(step);
                } else {
                  setShowCampaignOrbit(false);
                  setOrbitFade(0);
                  // Re-center Cosmos on the campaign we came from
                  const campaignId = lastOrbitCampaignIdRef.current || selectedCampaignId || detailPanelState.campaign?.id || null;
                  if (campaignId) {
                    const c = data.campaigns.find(cc => cc.id === campaignId);
                    if (c) {
                      const pos = getCampaignPosition(c);
                      setSelectedCampaignId(c.id);
                      setSelectedTargetPos(pos);
                    }
                  }
                }
              };
              requestAnimationFrame(step);
            }}
          >
            Return to Cosmos
          </button>
        </div>
      )}
      
      {/* Camera Position Controls (toggled from Settings) */}
      {isCameraPanelOpen && (
        <div className="fixed top-[97px] right-6 z-40">
          <div className="w-[320px] bg-gray-900/95 backdrop-blur-lg rounded-xl border border-white/15 p-4 text-white shadow-2xl">
            <div className="text-sm font-semibold mb-2">Current</div>
            <div className="text-xs text-gray-300 mb-3 space-y-1">
              <div>Camera: [{currentCameraPosition.map(n => n.toFixed(1)).join(', ')}]</div>
              <div>Target: [{currentTarget.map(n => n.toFixed(1)).join(', ')}]</div>
            </div>
            <div className="text-sm font-semibold mb-2">Desired (Apply/Save)</div>
            <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
              {(['X','Y','Z'] as const).map((axis, i) => (
                <input
                  key={axis}
                  type="number"
                  className="bg-white/10 border border-white/20 rounded px-2 py-1"
                  value={desiredCameraPosition[i]}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    const next: [number, number, number] = [...desiredCameraPosition] as any;
                    next[i] = isNaN(v) ? 0 : v;
                    setDesiredCameraPosition(next);
                  }}
                  placeholder={`Cam ${axis}`}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
              {(['X','Y','Z'] as const).map((axis, i) => (
                <input
                  key={axis}
                  type="number"
                  className="bg-white/10 border border-white/20 rounded px-2 py-1"
                  value={desiredTarget[i]}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    const next: [number, number, number] = [...desiredTarget] as any;
                    next[i] = isNaN(v) ? 0 : v;
                    setDesiredTarget(next);
                  }}
                  placeholder={`Target ${axis}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="flex-1 px-3 py-2 rounded-lg bg-primary text-white font-semibold"
                onClick={() => setApplyTick(t => t + 1)}
              >
                Apply Now
              </button>
              <button
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20"
                onClick={() => {
                  setInitialCameraPosition(desiredCameraPosition);
                  setInitialTarget(desiredTarget);
                  try {
                    localStorage.setItem('cosmos.initialCameraPosition', JSON.stringify(desiredCameraPosition));
                    localStorage.setItem('cosmos.initialTarget', JSON.stringify(desiredTarget));
                  } catch {}
                }}
              >
                Save as Default
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Controls (Top Left) */}
      <CosmosFloatingControls
        onFilterClick={() => setIsFilterPanelOpen(true)}
        onAlertsClick={() => openExclusivePanel(isAlertsPanelOpen ? 'none' : 'alerts')}
        alertsActive={isAlertsPanelOpen}
        onHelpClick={() => setIsHelpModalOpen(true)}
        onSearchClick={() => openExclusivePanel(isSearchOpen ? 'none' : 'search')}
        searchOpen={isSearchOpen}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClose={() => openExclusivePanel('none')}
        onAINavigatorClick={() => openExclusivePanel(isCommandBarOpen ? 'none' : 'ai')}
        onLaunchClick={() => openExclusivePanel(isLaunchPanelOpen ? 'none' : 'launch')}
        launchActive={isLaunchPanelOpen}
        onResetView={resetView}
        hideReset
        hideToggleNames
        showCampaignNames={showCampaignNames}
        onToggleCampaignNames={() => setShowCampaignNames(!showCampaignNames)}
      />
      
      {/* Filter Panel (Slides in from left) */}
      <CosmosFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
      />
      {/* Alerts Panel */}
      <CosmosAlertsPanel
        isOpen={isAlertsPanelOpen}
        onClose={() => {
          openExclusivePanel('none');
          setAlertFilterCampaignIds(null); // Clear filter when closing
            setSelectedAlertInfo(null);
        }}
        searchOpen={isSearchOpen}
          onFilterCampaigns={setAlertFilterCampaignIds}
          onSelectAlert={(alert) => setSelectedAlertInfo(alert)}
      />

      {/* Launch Readiness Panel */}
      <CosmosLaunchPanel
        isOpen={isLaunchPanelOpen}
        onClose={() => { openExclusivePanel('none'); }}
        searchOpen={isSearchOpen}
      />
      
      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
      {/* Search input now rendered next to the floating search button */}
      {/* AI Navigator Command Bar */}
      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => openExclusivePanel('none')}
        searchOpen={isSearchOpen}
      />
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsSettingsOpen(false)} />
          <div className="relative w-[420px] max-w-[92vw] bg-gray-900/95 backdrop-blur-xl border border-white/15 rounded-2xl p-5 text-white shadow-2xl">
            <div className="text-lg font-bold mb-4">Settings</div>
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-semibold">Show Camera Controls</div>
                <div className="text-xs text-gray-300">Enable the floating camera position panel</div>
              </div>
              <label className="inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isCameraPanelOpen}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setIsCameraPanelOpen(val);
                    try { localStorage.setItem('cosmos.showCameraControls', String(val)); } catch {}
                  }}
                />
                <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-primary transition-colors relative">
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
            {/* Dashboard Zoom Controls Visibility */}
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="font-semibold">Show Zoom Controls in Dashboard</div>
                <div className="text-xs text-gray-300">Affects non-3D Dashboard pages only</div>
              </div>
              <ToggleDashboardZoomSetting />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20"
                onClick={() => setIsSettingsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Layer Indicator removed in Cosmos view */}

      {/* Detail Panel - Slides in from right when planet is clicked */}
      {/* Use unified alert insight panel for all alert categories when an alert is selected */}
      {selectedAlertInfo && detailPanelState.isOpen ? (
        <AudienceFatigueDetailPanel
          isOpen={detailPanelState.isOpen}
          alert={selectedAlertInfo}
          campaigns={alertGroupCampaigns || []}
          onClose={handlePanelClose}
        />
      ) : (
        <CosmosDetailPanel
          isOpen={detailPanelState.isOpen}
          campaign={detailPanelState.campaign}
          onClose={handlePanelClose}
          selectedChild={selectedChild}
          campaignGroup={alertGroupCampaigns}
          selectedAlert={selectedAlertInfo || undefined}
          selectedCampaignId={selectedCampaignId}
        />
      )}

      {/* Bottom-center CTA to zoom into campaign */}
      {selectedCampaignId && !showCampaignOrbit && (
        <div
          className="absolute left-1/2 -translate-x-1/2 z-40"
          style={{ bottom: (() => {
            const el = document.getElementById('zoom-bar');
            if (!el) return '96px'; // fallback similar to bottom-24
            const rect = el.getBoundingClientRect();
            const viewportH = window.innerHeight || document.documentElement.clientHeight;
            const distanceFromBottom = Math.max(0, viewportH - rect.bottom);
            // Add small gap below the CTA
            return `${distanceFromBottom + 8}px`;
          })() }}
        >
          <button
            className="px-5 py-3 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-white font-semibold shadow-xl backdrop-blur-lg"
            onClick={() => {
              // Animate zoom level slightly to simulate zoom-in, then fade in orbit view
              const start = performance.now();
              const duration = 1400; // Slower animation (50% reduced speed)
              const startLevel = zoomState.level;
              const endLevel = Math.min(100, Math.max(60, startLevel + 30));
              // Remember the campaign we enter orbit with
              lastOrbitCampaignIdRef.current = detailPanelState.campaign?.id || selectedCampaignId;
              // Auto-close the detail panel so the orbit view is unobstructed
              if (detailPanelState.isOpen) {
                setDetailPanelState({ isOpen: false, campaign: null, isAnimating: false });
              }
              setShowCampaignOrbit(true);
              setOrbitFade(0);
              const step = () => {
                const now = performance.now();
                const t = Math.min(1, (now - start) / duration);
                const ease = t * (2 - t);
                const z = Math.round(startLevel + (endLevel - startLevel) * ease);
                setZoomLevel(z);
                setOrbitFade(ease);
                if (t < 1) {
                  requestAnimationFrame(step);
                } else {
                  setHideCosmos(true);
                }
              };
              requestAnimationFrame(step);
            }}
          >
            Zoom into Campaign
          </button>
        </div>
      )}

      {/* Campaign Names Toggle - lower left, next to Zoom controls */}
      {/* Campaign Names Toggle - fixed at bottom right */}
      <div className="fixed z-20 right-6 bottom-6">
        <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded-xl px-4 py-3 text-white w-[220px] pointer-events-auto select-none shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-200">Campaign names</span>
            <button
              onClick={() => setShowCampaignNames(!showCampaignNames)}
              className={`relative w-[2.25rem] h-[1.125rem] rounded-full transition-colors duration-200 ${
                showCampaignNames ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-[0.875rem] h-[0.875rem] bg-white rounded-full shadow transition-transform duration-200 ${
                  showCampaignNames ? 'translate-x-[1.125rem]' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Legend - positioned above Campaign Names toggle with 8px gap */}
      <div className={`fixed ${showCampaignOrbit ? 'z-40' : 'z-20'} right-6 flex flex-col gap-3`} style={{ bottom: 'calc(24px + 46px + 8px)' }}>
        {showCampaignOrbit ? (
          <CampaignOrbitLegend />
        ) : (
          <CosmosLegend
            visibleChannels={visibleChannels}
            onToggleChannel={handleToggleChannel}
            visibleStatuses={visibleStatuses}
            onToggleStatus={handleToggleStatus}
            alertsOnly={alertsOnly}
            onToggleAlertsOnly={handleToggleAlertsOnly}
            visibleTiers={visibleTiers}
            onToggleTier={handleToggleTier}
            visibleBands={visibleBands}
            onToggleBand={(key) => setVisibleBands(prev => ({ ...prev, [key]: !prev[key] }))}
            // NEW FRAMEWORK props
            visibleLifecycleStages={visibleLifecycleStages}
            onToggleLifecycleStage={handleToggleLifecycleStage}
            visibleFunnelStages={visibleFunnelStages}
            onToggleFunnelStage={handleToggleFunnelStage}
            visibleReadinessStatuses={visibleReadinessStatuses}
            onToggleReadinessStatus={handleToggleReadinessStatus}
            visibleSpendSizes={visibleSpendSizes}
            onToggleSpendSize={(size) => setVisibleSpendSizes(prev => ({ ...prev, [size]: !prev[size] }))}
          />
        )}
      </div>

      {/* Zoom Controls with Camera Position Logger Button */}
      <ZoomControls />

      {/* HTML overlay for 3D Html labels - ensure this sits above all UI layers */}
      <div id="cosmos-html-layer" className="absolute inset-0 z-[10000] pointer-events-none" />
    </div>
  );
};

