import { useChatStore } from '../../stores/useChatStore';
import { useTranslation } from '../../hooks/useTranslation';

// Lista ordenada de canales
const CHANNELS = ['all', 'system', 'ooc', 'radio', 'job', 'police', 'ems'];

export function ChannelTabs() {
    const { t } = useTranslation();
    const { activeChannel, setActiveChannel, unreadCounts, isVisible, settings } = useChatStore();

    // Si el chat está oculto, no renderizamos las tabs para mejorar rendimiento y estética
    if (!isVisible) return null;

    // Estilos dinámicos según la posición del chat (para alinear tabs)
    const alignmentStyle = {
        justifyContent: 'flex-start',
    };

    const chatWidth = settings.scale === 'large' ? 500 : settings.scale === 'small' ? 350 : 420;

    return (
        <div
            className="fixed flex gap-2 pointer-events-auto transition-all duration-300 ease-out z-50"
            style={{
                top: '20px', // Un poco separado del borde superior
                left: '20px', // Alineado con el chat (que tiene left: 20px en MessageFeed)
                width: `${chatWidth}px`,
                ...alignmentStyle,
                flexWrap: 'wrap' // Permitir que bajen si son muchos
            }}
        >
            {CHANNELS.map((channel) => {
                const isActive = activeChannel === channel;
                const unread = unreadCounts[channel] || 0;

                return (
                    <button
                        key={channel}
                        onClick={() => setActiveChannel(channel)}
                        className={`
                            relative px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200
                            ${isActive
                                ? 'bg-white text-gray-900 shadow-lg scale-105'
                                : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white'
                            }
                        `}
                        style={{
                            backdropFilter: 'blur(8px)',
                            border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        {t(`ui.channels.${channel}`)}

                        {/* 🔴 BADGE DE NO LEÍDO */}
                        {unread > 0 && !isActive && (
                            <span
                                className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full shadow-sm animate-pulse"
                                style={{ border: '2px solid rgba(0,0,0,0.2)' }}
                            >
                                {unread > 9 ? '9+' : unread}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
