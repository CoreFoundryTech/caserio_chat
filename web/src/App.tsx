import { useEffect } from 'react';
import { useChatStore } from './stores/useChatStore';
import { ChatContainer } from './components/bubble/ChatContainer';

function App() {
  const settings = useChatStore((state) => state.settings);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', settings.primaryColor);
  }, [settings.primaryColor]);

  // CRITICAL: Listen for NUI messages from Lua
  useEffect(() => {
    // Debug log to verify update
    console.log('CASERIO CHAT: Loading Version REF_850 - Transparency 0.15');

    const addMessage = useChatStore.getState().addMessage;
    const toggle = useChatStore.getState().toggleVisibility;

    const handleMessage = (event: MessageEvent) => {
      // Guard: event.data must exist and have action
      const { action, data } = event.data || {};
      if (!action) return;

      if (action === 'TOGGLE_VISIBILITY') {
        console.log('[App] TOGGLE_VISIBILITY received:', data);
        toggle(data);
      }

      if (action === 'ADD_MESSAGE' && data) {
        addMessage(data);
      }

      // NUEVOS HANDLERS PARA SUGERENCIAS DINÁMICAS
      if (action === 'ADD_SUGGESTION' && data) {
        // Debug: Log incoming suggestions to verify they are arriving
        // console.log('[Setup] Suggestion received:', data.name);
        useChatStore.getState().addSuggestion(data);
      }

      if (action === 'ADD_SUGGESTIONS_BATCH' && data) {
        console.log('[Setup] Batch suggestions received:', data.length);
        useChatStore.getState().addSuggestionsBatch(data);
      }

      if (action === 'REMOVE_SUGGESTION') {
        useChatStore.getState().removeSuggestion(data.name);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <>
      <style>{`
        :root {
          --primary-color: ${settings.primaryColor};
        }
      `}</style>

      {/* NEW ARCHITECTURE: Single Container for Position & Animation */}
      <ChatContainer />

    </>
  );
};

export default App;
