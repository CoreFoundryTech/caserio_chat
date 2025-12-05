import { useEffect } from 'react';

interface NuiMessage<T = any> {
    action: string;
    data: T;
}

export function useNuiEvent<T = any>(action: string, handler: (data: T) => void) {
    useEffect(() => {
        const eventListener = (event: MessageEvent<NuiMessage<T>>) => {
            const { action: eventAction, data } = event.data;

            if (eventAction === action) {
                handler(data);
            }
        };

        window.addEventListener('message', eventListener);

        return () => window.removeEventListener('message', eventListener);
    }, [action, handler]);
}
