import { useChatStore } from '../../stores/useChatStore';
import { useState } from 'react';

// Lista ordenada de canales
const CHANNELS = ['all', 'system', 'ooc', 'radio', 'job', 'police', 'ems'];

export function ChannelTabs() {
    const { activeChannel, setActiveChannel, unreadCounts, isVisible, settings } = useChatStore();
    const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);

    // Si el chat está oculto, no renderizamos las tabs para mejorar rendimiento y estética
    if (!isVisible) return null;

    const chatWidth = settings.scale === 'large' ? 500 : settings.scale === 'small' ? 350 : 420;

    return (
        <div
            className="flex gap-2 pointer-events-auto transition-all duration-300 ease-out"
            style={{
                width: `${chatWidth}px`,
                // REMOVED FIXED POSITIONING
                justifyContent: 'flex-start',
                flexWrap: 'wrap'
            }}
        >
            {CHANNELS.map((channel) => {
                const isActive = activeChannel === channel;
                const unread = unreadCounts[channel] || 0;

                // Iconos para cada canal
                const getChannelIcon = () => {
                    switch (channel) {
                        case 'all': return '📋'; // Todos - con texto
                        case 'system': return '⚙️';
                        case 'ooc': return '💬';
                        case 'radio': return '📻';
                        case 'job': return '💼';
                        case 'police': return '👮';
                        case 'ems': return '🚑';
                        default: return '•';
                    }
                };

                return (
                    <div key={channel} style={{ position: 'relative' }}>
                        <button
                            onClick={() => setActiveChannel(channel)}
                            onMouseEnter={(e) => {
                                setHoveredChannel(channel);
                                if (!isActive) {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; // Hover sutil
                                    e.currentTarget.style.color = 'white';
                                }
                            }}
                            onMouseLeave={(e) => {
                                setHoveredChannel(null);
                                if (!isActive) {
                                    e.currentTarget.style.background = 'rgba(20, 20, 30, 0.6)';
                                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                }
                            }}
                            style={{
                                position: 'relative',
                                padding: '8px 14px',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: 700,
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                border: isActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',

                                // ✅ DARK PASTEL THEME: Sólido oscuro elegante
                                background: isActive
                                    ? 'rgba(30, 30, 40, 1)'
                                    : 'rgba(20, 20, 30, 0.6)',

                                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.7)',

                                transform: isActive ? 'translateY(-1px)' : 'none',
                            }}
                        >
                            {channel === 'all' ? `${getChannelIcon()} Todos` : getChannelIcon()}

                            {/* 🔴 BADGE DE NO LEÍDO */}
                            {unread > 0 && !isActive && (
                                <span style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    right: '-4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '16px',
                                    height: '16px',
                                    padding: '0 3px',
                                    background: '#ef4444',
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    borderRadius: '9999px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                    border: '2px solid rgba(20,20,30,1)', // Borde oscuro para contraste
                                }} className="animate-pulse">
                                    {unread > 9 ? '9+' : unread}
                                </span>
                            )}
                        </button>

                        {/* ✅ CUSTOM TOOLTIP (BOTTOM) */}
                        {hoveredChannel === channel && (
                            <div style={{
                                position: 'absolute',
                                top: '120%', // MOVE TO BOTTOM
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(10, 10, 15, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                whiteSpace: 'nowrap',
                                pointerEvents: 'none',
                                zIndex: 100,
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                            }}>
                                {channel === 'all' ? 'Ver todos los canales' : `Canal ${channel.toUpperCase()}`}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
