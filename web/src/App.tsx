import { useEffect } from 'react';
import { useLocaleStore } from './stores/useLocaleStore';
import { useChatStore } from './stores/useChatStore';
import './utils/debugData'; // Initialize debug mode

// New Bubble Components
import { MessageFeed } from './components/bubble/MessageFeed';
import { InputIsland } from './components/bubble/InputIsland';
import { SettingsModal } from './components/bubble/SettingsModal';

function App() {
  const setLocale = useLocaleStore((state) => state.setLocale);
  const isVisible = useChatStore((state) => state.isVisible);
  const toggleVisibility = useChatStore((state) => state.toggleVisibility);
  const settings = useChatStore((state) => state.settings);

  // Load default locale on mount
  useEffect(() => {
    setLocale('es'); // Default to Spanish

    // Force visibility in dev mode
    if (import.meta.env.DEV && !isVisible) {
      console.log('%c[APP] Forcing chat visibility for dev mode', 'color: #ff00ff; font-weight: bold');
      toggleVisibility(true);
    }
  }, [setLocale]);

  // Sync primary color to CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
  }, [settings.primaryColor]);

  // Debug visibility log
  useEffect(() => {
    console.log('%c[APP] Chat visibility changed:', 'color: #00ff00', isVisible);
  }, [isVisible]);

  // ✅ CRITICAL: Listen for NUI messages
  useEffect(() => {
    const addMessage = useChatStore.getState().addMessage;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.action === 'ADD_MESSAGE') {
        console.log('%c[NUI] Received message:', 'color: #00ff00', event.data.data);
        addMessage(event.data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="w-full h-full bg-transparent overflow-hidden">
      {/* Dev Mode Debug Indicator */}
      {import.meta.env.DEV && (
        <div className="absolute top-4 left-4 text-white/50 text-xs z-50 pointer-events-none font-mono">
          [DEBUG] Visible: {isVisible ? 'YES' : 'NO'} | Pos: {settings.position}
        </div>
      )}

      {/* Layer 1: Message Feed (Bubbles) */}
      <MessageFeed />

      {/* Layer 2: Input Controls (Only visible when open) */}
      <InputIsland />

      {/* Layer 3: Modals (Settings) */}
      <SettingsModal />
    </div>
  );
}

export default App;
