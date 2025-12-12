// function isEnvBrowser moved inline to avoid dependencies
export const isEnvBrowser = (): boolean => !(window as any).GetParentResourceName;

// FLAG TO TOGGLE DEBUG MODE
const ENABLE_DEBUG_MOCKS = true;

// Mock NUI messages for development
if (import.meta.env.DEV && isEnvBrowser() && ENABLE_DEBUG_MOCKS) {
    console.log('%c[DEBUG MODE] Running in browser - mock data enabled', 'color: #00ff00; font-weight: bold');

    // Set background for transparency testing
    document.body.style.backgroundImage = "url('https://i.imgur.com/3m352cO.jpeg')"; // GTA V screenshot
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";

    // Ensure chat is visible
    setTimeout(() => {
        window.postMessage({ action: 'TOGGLE_VISIBILITY', data: true }, '*');
    }, 100);

    // Simulate mock messages every 3 seconds
    const mockMessages = [
        { type: 'me', author: 'John Doe', message: '* se rasca la cabeza *', channel: 'system', tags: [] },
        { type: 'do', author: 'Jane Smith', message: '*** Se ve un revolver en la mesa ***', channel: 'system', tags: [] },
        { type: 'police', author: 'Oficial Mike', message: '10-4, central, procediendo al código 3.', channel: 'police', tags: [] },
        { type: 'ems', author: 'Paramédico Sarah', message: 'Unidad médica en camino a Pillbox.', channel: 'ems', tags: [] },
        { type: 'radio', author: 'Frecuencia 1', message: '¿Alguien me copia por radio?', channel: 'radio', tags: [] },
        { type: 'system', author: 'SISTEMA', message: 'Has recibido $500 en efectivo.', channel: 'system', tags: [] },
    ] as const;

    let messageIndex = 0;

    // Send first message immediately
    setTimeout(() => {
        const mockMsg = mockMessages[0];
        window.postMessage({
            action: 'ADD_MESSAGE',
            data: {
                id: Math.random().toString(36),
                ...mockMsg,
                timestamp: Date.now(),
            }
        }, '*');
    }, 500);

    // Then send every 3 seconds
    setInterval(() => {
        messageIndex = (messageIndex + 1) % mockMessages.length;
        const mockMsg = mockMessages[messageIndex];
        window.postMessage({
            action: 'ADD_MESSAGE',
            data: {
                id: Math.random().toString(36),
                ...mockMsg,
                timestamp: Date.now(),
            }
        }, '*');
    }, 3000);
}

// Expose mock function for manual testing
if (isEnvBrowser()) {
    (window as any).mockNuiMessage = <T = any>(action: string, data: T) => {
        window.postMessage({ action, data }, '*');
        console.log('%c[MANUAL MOCK]', 'color: #ff00ff', action, data);
    };

    // Add helper functions for testing
    (window as any).sendTestMessage = (message: string, author = 'Test User', channel = 'system') => {
        (window as any).mockNuiMessage('ADD_MESSAGE', {
            id: Math.random().toString(36),
            author,
            message,
            channel,
            timestamp: Date.now(),
            tags: []
        });
    };
}
