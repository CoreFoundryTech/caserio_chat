import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    system: { icon: Terminal, label: 'SISTEMA', color: '#9ca3af' },
    job: { icon: Briefcase, label: 'TRABAJO', color: '#a78bfa' },
} as const;

const SCALE_STYLES = {
    small: { fontSize: '12px', padding: '6px 12px' }, // Slight font increase for legibility
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

    const sizeStyle = SCALE_STYLES[settings.scale] || SCALE_STYLES.medium;
    const typeConfig = MESSAGE_TYPE_CONFIG[message.type || 'system'] || MESSAGE_TYPE_CONFIG.system;
    const Icon = typeConfig.icon;
    const accentColor = typeConfig.color;

    useEffect(() => {
        const timer = setTimeout(() => setIsExpired(true), MESSAGE_VISIBLE_DURATION);
        return () => clearTimeout(timer);
    }, []);

    const sanitizedContent = useMemo(() => ({
        author: sanitizeAndColorize(message.author),
        message: sanitizeAndColorize(message.message)
    }), [message.author, message.message]);

    const shouldFade = isExpired && !isVisible;

    const bubbleStyle = {
        // Fondo muy transparente (20%) + backdrop
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        backdropFilter: 'blur(4px)',
        borderLeft: `2px solid ${accentColor}`,
        // Gradiente sutil
        backgroundImage: `linear-gradient(to right, ${accentColor}10, transparent)`,
        width: '100%', // Ocupar todo el ancho del contenedor padre
        borderRadius: '0 8px 8px 0',
        padding: sizeStyle.padding,
        marginBottom: '4px',
        position: 'relative' as const,
        fontSize: sizeStyle.fontSize,
        boxShadow: `0 0 10px -5px ${accentColor}40`
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: shouldFade ? 0 : 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ type: "tween", duration: 0.2 }}
            style={{ width: '100%', pointerEvents: shouldFade ? 'none' : 'auto' }}
        >
            <div style={bubbleStyle} className="hover:brightness-110 transition-all">
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', opacity: 0.9 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon size={12} color={accentColor} />
                        <span style={{
                            color: accentColor,
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            textShadow: '0 1px 2px rgba(0,0,0,0.8)' // Shadow for readability
                        }}>
                            {typeConfig.label}
                        </span>
                    </div>

                    {!settings.streamerMode ? (
                        <span
                            style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: 'rgba(255,255,255,0.7)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                            }}
                            dangerouslySetInnerHTML={{ __html: sanitizedContent.author }}
                        />
                    ) : (
                        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>HIDDEN</span>
                    )}
                </div>

                {/* Body - Text Shadow Critical */}
                <div
                    style={{
                        color: 'white',
                        fontWeight: 400,
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                        textShadow: '0 1px 3px rgba(0,0,0,0.9)' // Heavy shadow for white text on transparent bg
                    }}
                    dangerouslySetInnerHTML={{ __html: sanitizedContent.message }}
                />
            </div>
        </motion.div>
    );
});

MessageBubble.displayName = 'MessageBubble';
