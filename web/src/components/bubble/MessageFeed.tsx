import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../stores/useChatStore';
import { MessageBubble } from './MessageBubble';

// Tamaños - MISMO para chat e input
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
        const pos = settings.position || 'top-left';
        const base: React.CSSProperties = {
            position: 'fixed',
            zIndex: 10,
            width: `${chatWidth}px`,
            maxHeight: '210px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '10px',
            paddingBottom: '0',
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'none',
        };

        if (pos.includes('left')) base.left = '10px';
        else if (pos.includes('right')) base.right = '10px';
        else { base.left = '50%'; base.transform = 'translateX(-50%)'; }

        if (pos.includes('top')) base.top = '10px';
        else if (pos.includes('bottom')) base.bottom = '60px';
        else base.top = '20%';

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
