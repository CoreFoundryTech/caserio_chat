import { useEffect } from 'react';
import { useLocaleStore } from './stores/useLocaleStore';
import { useChatStore } from './stores/useChatStore';

import { MessageFeed } from './components/bubble/MessageFeed';
import { InputIsland } from './components/bubble/InputIsland';
import { SettingsModal } from './components/bubble/SettingsModal';
import { ChannelTabs } from './components/bubble/ChannelTabs'; // ✅ Importar

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

      // NUEVOS HANDLERS PARA SUGERENCIAS DINÁMICAS
      if (action === 'ADD_SUGGESTION') {
        useChatStore.getState().addSuggestion(data);
      }

      if (action === 'REMOVE_SUGGESTION') {
        useChatStore.getState().removeSuggestion(data.name);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', background: 'transparent', overflow: 'hidden' }}>
      {/* ✅ AÑADIR TABS AQUÍ */}
      <ChannelTabs />

      <MessageFeed />
      <InputIsland />
      <SettingsModal />
    </div>
  );
}

export default App;
