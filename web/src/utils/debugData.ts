/**
 * Debug data utility for browser development
 * Simulates NUI messages when running outside FiveM
 */

export const isEnvBrowser = (): boolean => !(window as any).GetParentResourceName;

// Mock NUI messages for development
if (import.meta.env.DEV && isEnvBrowser()) {
    console.log('%c[DEBUG MODE] Running in browser - mock data enabled', 'color: #00ff00; font-weight: bold');
    console.log('%cChat will auto-populate with test messages every 3 seconds', 'color: #ffaa00');

    // Simulate mock messages every 3 seconds
    const mockMessages = [
        { type: 'me', author: '^1John Doe', message: '* se rasca la cabeza', channel: 'system', tags: ['RP'] },
        { type: 'do', author: 'Jane Smith', message: '** Hay un cigarro en la arena **', channel: 'system', tags: ['RP'] },
        { type: 'police', author: '^4Officer Mike', message: '10-4, heading to location', channel: 'police', tags: ['POLICE'] },
        { type: 'ems', author: '^2Dr. Sarah', message: 'Medic en route to Legion Square', channel: 'ems', tags: ['EMS'] },
        { type: 'system', author: '^8Admin', message: '^3Server restart in 10 minutes', channel: 'system', tags: ['ADMIN', 'IMPORTANT'] },
        { type: 'radio', author: '^6DJ Music', message: '🎵 Now playing: Los Angeles', channel: 'radio', tags: [] },
        { type: 'job', author: 'Boss', message: 'Team meeting at the warehouse', channel: 'job', tags: [] },
        { type: 'system', author: '^9Support', message: 'Type /help for commands', channel: 'system', tags: ['INFO'] },
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
        console.log('%c[MOCK] Sent initial message', 'color: #00aaff', mockMsg);
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
        console.log('%c[MOCK] New message', 'color: #00aaff', mockMsg);
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

    console.log('%c[DEBUG HELPERS] Available commands:', 'color: #ffaa00; font-weight: bold');
    console.log('  - window.sendTestMessage("mensaje", "autor", "canal")');
    console.log('  - window.mockNuiMessage("ADD_MESSAGE", {...})');
}
