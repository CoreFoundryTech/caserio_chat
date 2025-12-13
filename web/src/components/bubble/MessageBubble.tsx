import React, { useMemo, useState, useEffect } from 'react';
import { User, Eye, Radio, Briefcase, Shield, Ambulance, Terminal } from 'lucide-react';
import type { Message, ChatSettings } from '../../stores/useChatStore';
import { sanitizeAndColorize } from '../../utils/sanitize';
import { useChatStore } from '../../stores/useChatStore';

const MESSAGE_TYPE_CONFIG = {
    me: { icon: User, label: 'YO', color: '#ec4899' },
    do: { icon: Eye, label: 'ENTORNO', color: '#f59e0b' },
    radio: { icon: Radio, label: 'RADIO', color: '#34d399' },
    police: { icon: Shield, label: 'POLICIA', color: '#60a5fa' },
    ems: { icon: Ambulance, label: 'EMS', color: '#f87171' },
    system: { icon: Terminal, label: 'SISTEMA', color: '#6b7280' }, // Gris oscuro para sitema en tema claro
    job: { icon: Briefcase, label: 'TRABAJO', color: '#a78bfa' },
} as const;

const SCALE_STYLES = {
    small: { fontSize: '12px', padding: '6px 12px' },
    medium: { fontSize: '14px', padding: '8px 14px' },
    large: { fontSize: '16px', padding: '10px 18px' },
};

const MESSAGE_VISIBLE_DURATION = 8000;

interface MessageBubbleProps {
    message: Message;
    settings: ChatSettings;
}

export const MessageBubble = React.memo(({ message, settings }: MessageBubbleProps) => {
    const isVisible = useChatStore((state) => state.isVisible);
    const [isExpired, setIsExpired] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const sizeStyle = SCALE_STYLES[settings.scale] || SCALE_STYLES.medium;
    const typeConfig = MESSAGE_TYPE_CONFIG[message.type || 'system'] || MESSAGE_TYPE_CONFIG.system;
    const Icon = typeConfig.icon;
    const accentColor = typeConfig.color;

    useEffect(() => {
        const timer = setTimeout(() => setIsExpired(true), MESSAGE_VISIBLE_DURATION);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const sanitizedContent = useMemo(() => ({
        author: sanitizeAndColorize(message.author),
        message: sanitizeAndColorize(message.message)
    }), [message.author, message.message]);

    const shouldFade = isExpired && !isVisible;

    // ESTILOS ESPECIALES PARA MENCIONES
    const isMention = message.isMention || false;

    const bubbleStyle = {
        // ✅ TEMA DARK PASTEL
        background: isMention
            ? 'linear-gradient(90deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))'
            : 'rgba(20, 20, 30, 0.70)', // Fondo oscuro semitransparente

        // Borde izquierdo de color
        borderLeft: isMention
            ? `3px solid #EAB308`
            : `3px solid ${accentColor}`,

        // Sombra suave
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',

        // GPU Acceleration
        transform: 'translateZ(0)',
        width: '100%',
        borderRadius: '0 10px 10px 0',
        padding: sizeStyle.padding,
        marginBottom: '6px',
        position: 'relative' as const,
        fontSize: sizeStyle.fontSize,
        color: 'rgba(255, 255, 255, 0.90)', // Texto claro

        // ✨ Animación de pulso para menciones
        animation: isMention ? 'mentionPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
    };

    return (
        <div
            className="transition-all duration-200 ease-out"
            style={{
                width: '100%',
                pointerEvents: shouldFade ? 'none' : 'auto',
                opacity: isMounted && !shouldFade ? 1 : 0,
                transform: isMounted && !shouldFade ? 'translateX(0)' : 'translateX(-10px)'
            }}
        >
            <div style={bubbleStyle} className="hover:brightness-110 transition-all">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>

                    {/* BADGE TIPO DE MENSAJE */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: accentColor,
                        padding: '2px 6px',
                        borderRadius: '4px',
                    }}>
                        <Icon size={11} color="white" />
                        <span style={{
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: '900', // Extra bold
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                        }}>
                            {typeConfig.label}
                        </span>
                    </div>

                    {!settings.streamerMode && (
                        <span
                            style={{
                                fontSize: '12px',
                                fontWeight: 600,
                                color: 'rgba(255, 255, 255, 0.8)', // Gris claro
                            }}
                            dangerouslySetInnerHTML={{ __html: sanitizedContent.author }}
                        />
                    )}
                </div>

                {/* Body - Texto Blanco */}
                <div
                    style={{
                        color: 'rgba(255, 255, 255, 0.95)', // Blanco casi puro
                        fontWeight: 500,
                        lineHeight: 1.4,
                        wordBreak: 'break-word',
                        textShadow: '0 1px 1px rgba(0,0,0,0.2)'
                    }}
                    dangerouslySetInnerHTML={{ __html: sanitizedContent.message }}
                />
            </div>
        </div>
    );
});

MessageBubble.displayName = 'MessageBubble';
