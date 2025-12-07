import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../stores/useChatStore';
import { MessageBubble } from './MessageBubble';

// Constantes compartidas
const CHAT_SIZES = {
    small: 350,
    medium: 420,
    large: 500,
};

export function MessageFeed() {
    const messages = useChatStore((state) => state.messages);
    const settings = useChatStore((state) => state.settings);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const chatWidth = CHAT_SIZES[settings.scale] || CHAT_SIZES.medium;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getPositionStyles = (): React.CSSProperties => {
        // ALINEACIÓN PERFECTA CON InputIsland
        // Input está en: left: 20px, top: 50%, width: chatWidth
        // Feed debe estar: left: 20px, bottom: calc(50% + 30px), width: chatWidth
        const base: React.CSSProperties = {
            position: 'fixed',
            left: '20px', // MISMA X QUE INPUT
            width: `${chatWidth}px`, // MISMO ANCHO QUE INPUT
            bottom: 'calc(50% + 30px)', // Justo encima del input
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'none',
            pointerEvents: 'auto',
            zIndex: 40,
            // Máscara de desvanecimiento en la parte superior
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)',
            maxHeight: '35vh' // Altura razonable
        };

        return base;
    };

    if (messages.length === 0) return null;

    return (
        <div style={getPositionStyles()}>
            <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} settings={settings} />
                ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
        </div>
    );
}
