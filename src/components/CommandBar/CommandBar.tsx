import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Sparkles } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { parseIntent } from './NLPEngine';
import { IntentObject, Suggestion } from './types';
import { getContextSuggestions } from './suggestions';
import { executeNavigation } from './NavigationController';

/* cspell:words NLP FC idx ROAS roas bg */

interface CommandBarProps {
  isOpen?: boolean;
  onClose?: () => void;
  searchOpen?: boolean;
}

// Typewriter words for placeholder
const PLACEHOLDER_WORDS = ['insight', 'campaign', 'trend', 'opportunity'];
const WORD_DISPLAY_DURATION = 2500; // How long each word stays visible (ms)
const TYPING_SPEED = 80; // Speed of typing each character (ms)
const DELETING_SPEED = 50; // Speed of deleting each character (ms)

export const CommandBar: React.FC<CommandBarProps> = ({ isOpen: externalIsOpen, onClose, searchOpen = false }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  
  // Typewriter state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedWord, setDisplayedWord] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data, activeView, zoomState, setZoomLevel, setFocusedCampaign } = useDashboard();
  const { campaigns, channels } = data;

  // Use external control if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
    setInputValue('');
  };

  // Typewriter effect
  useEffect(() => {
    if (!isOpen) return;
    
    const currentWord = PLACEHOLDER_WORDS[currentWordIndex];
    
    let timeout: ReturnType<typeof setTimeout>;
    
    if (isPaused) {
      // Wait before starting to delete
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, WORD_DISPLAY_DURATION);
    } else if (isDeleting) {
      if (displayedWord.length > 0) {
        // Delete one character
        timeout = setTimeout(() => {
          setDisplayedWord(prev => prev.slice(0, -1));
        }, DELETING_SPEED);
      } else {
        // Move to next word
        setIsDeleting(false);
        setCurrentWordIndex(prev => (prev + 1) % PLACEHOLDER_WORDS.length);
      }
    } else {
      if (displayedWord.length < currentWord.length) {
        // Type one character
        timeout = setTimeout(() => {
          setDisplayedWord(currentWord.slice(0, displayedWord.length + 1));
        }, TYPING_SPEED);
      } else {
        // Word fully typed, pause
        setIsPaused(true);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [isOpen, displayedWord, isDeleting, isPaused, currentWordIndex]);

  // Reset typewriter when panel opens
  useEffect(() => {
    if (isOpen) {
      setCurrentWordIndex(0);
      setDisplayedWord('');
      setIsDeleting(false);
      setIsPaused(false);
    }
  }, [isOpen]);

  // Handle keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (externalIsOpen !== undefined && onClose) {
          return;
        }
        setInternalIsOpen(true);
      }
      
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, externalIsOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Parse intent when input changes (debounced)
  useEffect(() => {
    if (!inputValue.trim()) {
      const contextSugs = getContextSuggestions(activeView, zoomState.level, campaigns, channels);
      setSuggestions(contextSugs);
      return;
    }

    const timer = setTimeout(() => {
      const intent = parseIntent(inputValue, campaigns, channels);
      const newSuggestions = generateSuggestionsFromIntent(intent, campaigns);
      setSuggestions(newSuggestions);
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, campaigns, channels, activeView, zoomState.level]);

  // Generate suggestions from parsed intent
  const generateSuggestionsFromIntent = (
    intent: IntentObject,
    campaigns: any[]
  ): Suggestion[] => {
    const sugs: Suggestion[] = [];

    if (intent.type === 'navigate' && intent.target) {
      sugs.push({
        id: 'nav-1',
        type: 'navigate',
        icon: '🎯',
        primaryText: `Go to ${intent.target.entityName}`,
        secondaryText: `Navigate to ${intent.target.entityType}`,
        intent,
        category: 'Navigation'
      });
    }

    if (intent.type === 'query') {
      const matchingCampaigns = campaigns.filter(c => 
        c.name.toLowerCase().includes(inputValue.toLowerCase())
      ).slice(0, 5);

      matchingCampaigns.forEach((campaign, idx) => {
        sugs.push({
          id: `query-${idx}`,
          type: 'query',
          icon: '📊',
          primaryText: campaign.name,
          secondaryText: `${campaign.channel} • $${(campaign.spend / 1000).toFixed(0)}K • ROAS ${campaign.roas.toFixed(1)}`,
          intent: {
            type: 'navigate',
            target: {
              entityType: 'campaign',
              entityId: campaign.id,
              entityName: campaign.name
            },
            confidence: 0.9
          },
          category: 'Campaigns'
        });
      });
    }

    if (intent.type === 'action') {
      sugs.push({
        id: 'action-1',
        type: 'action',
        icon: '⚡',
        primaryText: `${intent.action?.charAt(0).toUpperCase()}${intent.action?.slice(1)} ${intent.target?.entityName || 'campaigns'}`,
        secondaryText: 'Preview action before executing',
        intent,
        category: 'Actions'
      });
    }

    return sugs;
  };

  // Handle suggestion selection
  const handleSelectSuggestion = useCallback((suggestion: Suggestion) => {
    const intent = suggestion.intent;
    setActiveSuggestionId(suggestion.id);
    if (suggestion.id === 'cosmos-launch-readiness') {
      try {
        window.dispatchEvent(new CustomEvent('cosmos:setLaunchReadiness', { detail: { enabled: true } }));
      } catch {}
      return;
    }
    if (suggestion.id === 'cosmos-default-view') {
      try {
        window.dispatchEvent(new CustomEvent('cosmos:setDefaultView'));
      } catch {}
      return;
    }
    if (intent.type === 'navigate' || intent.type === 'query') {
      executeNavigation(intent, activeView, setZoomLevel, setFocusedCampaign, campaigns, channels);
    } else if (intent.type === 'action') {
      console.log('Action intent:', intent);
    } else {
      executeNavigation(intent, activeView, setZoomLevel, setFocusedCampaign, campaigns, channels);
    }
  }, [activeView, setZoomLevel, setFocusedCampaign, campaigns, channels]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && suggestions[selectedIndex]) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Glassmorphic AI Navigator Panel with Deep Blue/Purple Animated Gradient */}
      <motion.div
        initial={{ x: -420, opacity: 0 }}
        animate={{ x: 0, opacity: 1, top: searchOpen ? 242 : 97 }}
        exit={{ x: -420, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed left-24 z-[60] w-[320px] rounded-2xl overflow-hidden flex flex-col"
        style={{ 
          top: searchOpen ? 242 : 97,
          bottom: 24,
          // Glassmorphism base - consistent with other panels
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1)
          `,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Deep Blue/Purple Animated Gradient Background */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          {/* Base dark layer for depth */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(12, 12, 20, 0.95) 0%, rgba(8, 8, 16, 0.98) 100%)',
            }}
          />
          
          {/* Primary animated gradient - deep blue to purple */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 120% 80% at 20% 20%, rgba(30, 58, 138, 0.4), transparent 50%),
                radial-gradient(ellipse 100% 100% at 80% 80%, rgba(55, 48, 163, 0.35), transparent 50%),
                radial-gradient(ellipse 80% 60% at 50% 100%, rgba(30, 64, 175, 0.3), transparent 40%)
              `,
            }}
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Secondary moving gradient layer */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 100% 80% at 70% 30%, rgba(67, 56, 202, 0.25), transparent 45%),
                radial-gradient(ellipse 90% 70% at 30% 70%, rgba(79, 70, 229, 0.2), transparent 45%)
              `,
            }}
            animate={{
              x: [0, 20, 0, -20, 0],
              y: [0, -15, 0, 15, 0],
              scale: [1, 1.05, 1, 1.05, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Tertiary subtle purple accent */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 60% 50% at 60% 50%, rgba(79, 70, 229, 0.15), transparent 50%)
              `,
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              x: [-10, 10, -10],
              y: [5, -5, 5],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          {/* Glass overlay for proper glassmorphism effect */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
            }}
          />
        </div>

        {/* Header - Glassmorphic with gradient */}
        <div 
          className="relative flex items-center justify-between p-5 pb-4"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center gap-3 relative z-10">
            {/* Icon Container - Static */}
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 0 12px rgba(59, 130, 246, 0.2)',
              }}
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>

            {/* Title - Same styling as Alerts and Launch panels */}
            <div className="min-w-0">
              <h2 className="text-white font-semibold text-sm tracking-wide">AI Navigator</h2>
              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>

          <button 
            onClick={handleClose} 
            className="p-2 rounded-lg transition-all duration-200 hover:scale-105 relative z-10"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Input Section - Glassmorphic with Typewriter Placeholder */}
        <div 
          className="relative flex items-center gap-3 px-4 py-3"
          style={{
            background: 'rgba(30, 30, 35, 0.4)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              className="w-full bg-transparent text-white text-sm outline-none"
              style={{
                caretColor: '#60A5FA',
              }}
            />
            {/* Custom animated placeholder */}
            {!inputValue && (
              <div className="absolute inset-0 flex items-center pointer-events-none text-sm text-gray-500">
                <span>What </span>
                <span className="ml-1">{displayedWord}</span>
                <span className="ml-1">are you looking for?</span>
              </div>
            )}
          </div>
          {inputValue && (
            <button 
              onClick={() => setInputValue('')} 
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Focus glow indicator */}
          {inputFocused && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                boxShadow: 'inset 0 0 8px rgba(59, 130, 246, 0.15)',
              }}
            />
          )}
        </div>

        {/* Results - Glassmorphic Cards */}
        <div 
          className="flex-1 overflow-y-auto relative"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255, 255, 255, 0.15) rgba(255, 255, 255, 0.05)',
          }}
        >
          {suggestions.length === 0 ? (
            <motion.div 
              className="px-6 py-12 text-center relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Search className="w-12 h-12 mx-auto mb-3 text-gray-500 opacity-50" />
              <p className="text-gray-400">No results found</p>
              <p className="text-sm mt-1 text-gray-500">Try searching for campaigns, channels, or actions</p>
            </motion.div>
          ) : (
            <div className="p-3 pb-6 space-y-2.5 relative z-10">
              {suggestions.map((suggestion, index) => {
                const isSelected = activeSuggestionId === suggestion.id;
                const isHovered = hoveredCardId === suggestion.id;
                
                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.2, 
                      delay: index * 0.03,
                    }}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    onMouseEnter={() => {
                      setSelectedIndex(index);
                      setHoveredCardId(suggestion.id);
                    }}
                    onMouseLeave={() => setHoveredCardId(null)}
                    className="p-3 cursor-pointer rounded-lg transition-all duration-200"
                    style={{
                      background: isSelected 
                        ? 'rgba(59, 130, 246, 0.15)' 
                        : 'rgba(30, 30, 35, 0.6)',
                      backdropFilter: 'blur(12px)',
                      border: isSelected 
                        ? '1px solid rgba(96, 165, 250, 0.5)' 
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow: isSelected
                        ? '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 0 8px rgba(59, 130, 246, 0.1)'
                        : isHovered
                          ? '0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
                          : '0 2px 8px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                      transform: isHovered && !isSelected ? 'translateY(-2px)' : 'translateY(0)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.span 
                        className="text-2xl"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {suggestion.icon}
                      </motion.span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm truncate">
                          {suggestion.primaryText}
                        </div>
                        {suggestion.secondaryText && (
                          <div className="text-[11px] text-gray-400 truncate mt-0.5">
                            {suggestion.secondaryText}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
