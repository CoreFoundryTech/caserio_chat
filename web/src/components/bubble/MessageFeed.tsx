import { useState, useMemo, useRef } from 'react';
import { Virtuoso, type VirtuosoHandle } from 'react-virtuoso';
import { useChatStore } from '../../stores/useChatStore';
import { MessageBubble } from './MessageBubble';

const CHAT_SIZES = {
    small: 350,
    medium: 420,
    large: 500,
};

export function MessageFeed() {
    const messages = useChatStore((state) => state.messages);
    const activeChannel = useChatStore((state) => state.activeChannel);
    const settings = useChatStore((state) => state.settings);
    const isVisible = useChatStore((state) => state.isVisible);

    // Referencia para controlar el scroll programáticamente si hace falta
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const [isHovered, setIsHovered] = useState(false);

    const chatWidth = CHAT_SIZES[settings.scale] || CHAT_SIZES.medium;

    // Filtrado de mensajes (useMemo para optimizar)
    const filteredMessages = useMemo(() => {
        if (activeChannel === 'all') return messages;
        return messages.filter(msg => msg.channel === activeChannel);
    }, [messages, activeChannel]);

    // Estilos del contenedor (AHORA RELATIVO A ChatContainer)
    const getPositionStyles = (): React.CSSProperties => {
        return {
            position: 'relative', // ✅ RELATIVO
            width: `${chatWidth}px`,
            height: '35vh',
            zIndex: 40,

            // Máscara para desvanecimiento suave arriba
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%)',

            // Pointer events
            pointerEvents: isVisible ? 'auto' : 'none',
        };
    };

    // if (filteredMessages.length === 0) return null; // ❌ ESTO CAUSABA EL SALTO DE LAYOUT.
    // ✅ FIX: Siempre renderizar el contenedor para mantener el espacio vital.

    return (
        <div
            style={getPositionStyles()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* COMPONENTE VIRTUOSO */}
            <Virtuoso
                ref={virtuosoRef}
                style={{ height: '100%', width: '100%' }}
                data={filteredMessages}

                // Renderizado de cada item
                itemContent={(_index, msg) => (
                    <div className="pb-1 pr-2"> {/* Padding para separar burbujas */}
                        <MessageBubble message={msg} settings={settings} />
                    </div>
                )}

                // Auto-scroll inteligente nativo
                // "auto": Sigue abajo si estaba abajo. Si subes, se queda donde estás.
                followOutput={isHovered ? false : 'auto'}

                // Alineación inicial: Pegado abajo
                alignToBottom={true}

                // Ocultar scrollbar visualmente pero mantener funcionalidad
                className="scrollbar-hide"
            />

            {/* Estilo inline para ocultar scrollbar en este componente específico */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
