import { useRef, useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useChatStore } from '../../stores/useChatStore';
import { MessageBubble } from './MessageBubble';
import { positionClasses } from '../../utils/bubble/positionClasses';
import classNames from 'classnames';

export function MessageFeed() {
    const messages = useChatStore((state) => state.messages);
    const settings = useChatStore((state) => state.settings);
    const isVisible = useChatStore((state) => state.isVisible);

    const containerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isUserScrolling, setIsUserScrolling] = useState(false);

    // Detectar scroll manual del usuario para pausar el auto-scroll
    const handleScroll = () => {
        if (!containerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        // Si el usuario sube más de 50px del fondo, consideramos que está leyendo el historial
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

        setIsUserScrolling(!isAtBottom);
    };

    // Auto-scroll inteligente: Solo baja si el usuario NO está leyendo arriba
    useEffect(() => {
        if (!isUserScrolling && messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isUserScrolling]);

    const positionClass = positionClasses[settings.position] || positionClasses['top-left'];

    // Lógica crítica: Solo permitir interacción si el chat está abierto
    const pointerEventsClass = isVisible ? 'pointer-events-auto' : 'pointer-events-none';
    const scrollClass = isVisible ? 'overflow-y-auto' : 'overflow-hidden';

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className={classNames(
                "fixed z-10 flex flex-col gap-2 p-4 w-full max-w-full",
                "max-h-[50vh]", // ✅ Límite de altura: 50% de la pantalla
                positionClass,
                pointerEventsClass,
                scrollClass
            )}
            style={{
                scrollbarWidth: 'none', // Ocultar barra de scroll visualmente (estética)
                // Máscara para desvanecer mensajes antiguos en la parte superior
                // TEMPORALMENTE DESACTIVADO PARA DEBUG
                // maskImage: 'linear-gradient(to bottom, transparent, black 15%)',
                // WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%)',
            }}
        >
            <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        settings={settings}
                    />
                ))}
            </AnimatePresence>

            {/* Ancla invisible para auto-scroll */}
            <div ref={messagesEndRef} />
        </div>
    );
}
