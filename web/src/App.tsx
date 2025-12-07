import { useEffect } from 'react';
import { useLocaleStore } from './stores/useLocaleStore';
import { useChatStore } from './stores/useChatStore';

import { MessageFeed } from './components/bubble/MessageFeed';
import { InputIsland } from './components/bubble/InputIsland';
import { SettingsModal } from './components/bubble/SettingsModal';

function App() {
  const setLocale = useLocaleStore((state) => state.setLocale);
  const settings = useChatStore((state) => state.settings);

  useEffect(() => {
    setLocale('es');
  }, [setLocale]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
  }, [settings.primaryColor]);

  // CRITICAL: Listen for NUI messages from Lua
  useEffect(() => {
    const addMessage = useChatStore.getState().addMessage;
    const toggleVisibility = useChatStore.getState().toggleVisibility;

    const handleMessage = (event: MessageEvent) => {
      // Guard: event.data must exist and have action
      if (!event.data || typeof event.data !== 'object') return;

      const { action, data } = event.data;

      if (action === 'TOGGLE_VISIBILITY') {
        toggleVisibility(data);
      }

      if (action === 'ADD_MESSAGE' && data) {
        addMessage(data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent', overflow: 'hidden' }}>
      <MessageFeed />
      <InputIsland />
      <SettingsModal />
    </div>
  );
}

export default App;
