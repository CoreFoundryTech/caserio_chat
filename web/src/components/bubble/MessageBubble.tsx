import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Eye, Radio, Briefcase, Shield, Ambulance, Terminal } from 'lucide-react';
import type { Message, ChatSettings } from '../../stores/useChatStore';
import { getMessageBorderColor } from '../../utils/bubble/messageBorderColor';
import { sanitizeAndColorize } from '../../utils/sanitize';
import { useChatStore } from '../../stores/useChatStore';

const MESSAGE_TYPE_CONFIG = {
    me: { icon: User, label: 'YO', color: '#F472B6' },
    do: { icon: Eye, label: 'ENTORNO', color: '#FBBF24' },
    radio: { icon: Radio, label: 'RADIO', color: '#34D399' },
    police: { icon: Shield, label: 'POLICÍA', color: '#60A5FA' },
    ems: { icon: Ambulance, label: 'EMS', color: '#F87171' },
    system: { icon: Terminal, label: 'SISTEMA', color: '#9CA3AF' },
    job: { icon: Briefcase, label: 'TRABAJO', color: '#A78BFA' },
} as const;

const SCALE_SIZES = {
    small: { fontSize: '11px', padding: '6px 10px', iconSize: 10 },
    medium: { fontSize: '13px', padding: '8px 12px', iconSize: 12 },
    large: { fontSize: '15px', padding: '10px 14px', iconSize: 14 },
};

const MESSAGE_VISIBLE_DURATION = 8000;

interface MessageBubbleProps {
    message: Message;
    settings: ChatSettings;
}

export const MessageBubble = React.memo(({ message, settings }: MessageBubbleProps) => {
    const isVisible = useChatStore((state) => state.isVisible);
    const [isExpired, setIsExpired] = useState(false);

    const borderColor = getMessageBorderColor(message, settings.primaryColor);
    const scale = SCALE_SIZES[settings.scale] || SCALE_SIZES.medium;
    const typeConfig = MESSAGE_TYPE_CONFIG[message.type || 'system'] || MESSAGE_TYPE_CONFIG.system;
    const Icon = typeConfig.icon;

    useEffect(() => {
        const timer = setTimeout(() => setIsExpired(true), MESSAGE_VISIBLE_DURATION);
        return () => clearTimeout(timer);
    }, []);

    const sanitizedContent = useMemo(() => ({
        author: sanitizeAndColorize(message.author),
        message: sanitizeAndColorize(message.message)
    }), [message.author, message.message]);

    const shouldFade = isExpired && !isVisible;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: shouldFade ? 0 : 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 500, damping: 35, opacity: { duration: 0.2 } }}
            style={{ maxWidth: '100%', width: 'fit-content', pointerEvents: shouldFade ? 'none' : 'auto' }}
        >
            <div style={{
                backgroundColor: `rgba(0, 0, 0, ${Math.min((settings.opacity || 70) / 100, 0.7)})`,
                backdropFilter: 'blur(8px)',
                borderRadius: '0 10px 10px 0',
                borderLeft: `3px solid ${borderColor}`,
                padding: scale.padding,
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '3px',
                        padding: '2px 6px', backgroundColor: typeConfig.color + '20', borderRadius: '6px',
                    }}>
                        <Icon size={scale.iconSize} color={typeConfig.color} />
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: typeConfig.color, letterSpacing: '0.5px' }}>
                            {typeConfig.label}
                        </span>
                    </div>
                    {!settings.streamerMode ? (
                        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}
                            dangerouslySetInnerHTML={{ __html: sanitizedContent.author }} />
                    ) : (
                        <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Oculto</span>
                    )}
                </div>
                {/* Mensaje */}
                <div style={{ color: 'rgba(255, 255, 255, 0.95)', fontSize: scale.fontSize, lineHeight: 1.5, wordBreak: 'break-word' }}
                    dangerouslySetInnerHTML={{ __html: sanitizedContent.message }} />
            </div>
        </motion.div>
    );
});

MessageBubble.displayName = 'MessageBubble';
