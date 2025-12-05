import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Eye, Radio, Briefcase, Shield, Ambulance, Terminal } from 'lucide-react';
import type { Message, ChatSettings } from '../../stores/useChatStore';
import { getMessageBorderColor } from '../../utils/bubble/messageBorderColor';
import { scaleClasses } from '../../utils/bubble/scaleClasses';
import { sanitizeAndColorize } from '../../utils/sanitize';
import { useTranslation } from '../../hooks/useTranslation';

// ✅ Configuración de Tipos Visuales (iconos y colores)
const MESSAGE_TYPE_CONFIG = {
    me: { icon: User, color: '#FFFFFF' },
    do: { icon: Eye, color: '#EF4444' },
    radio: { icon: Radio, color: '#10B981' },
    police: { icon: Shield, color: '#3B82F6' },
    ems: { icon: Ambulance, color: '#10B981' },
    system: { icon: Terminal, color: '#6B7280' },
    job: { icon: Briefcase, color: '#8B5CF6' },
} as const;

interface MessageBubbleProps {
    message: Message;
    settings: ChatSettings;
}

export const MessageBubble = React.memo(({ message, settings }: MessageBubbleProps) => {
    const { t } = useTranslation();
    const borderColor = getMessageBorderColor(message, settings.primaryColor);
    const scaleClass = scaleClasses[settings.scale];

    // ✅ Seleccionar configuración según message.type
    const typeConfig = MESSAGE_TYPE_CONFIG[message.type || 'system'] || MESSAGE_TYPE_CONFIG.system;
    const Icon = typeConfig.icon;

    // ✅ Obtener label traducido
    const typeLabel = t(`ui.message_types.${message.type || 'system'}`);

    // Sanitización de seguridad
    const sanitizedContent = useMemo(() => {
        return {
            author: sanitizeAndColorize(message.author),
            message: sanitizeAndColorize(message.message)
        };
    }, [message.author, message.message]);

    const isStreamerMode = settings.streamerMode;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`relative group ${scaleClass} w-fit max-w-[500px]`}
        >
            <div
                className="backdrop-blur-md rounded-r-lg shadow-lg flex flex-col overflow-hidden transition-all duration-300"
                style={{
                    backgroundColor: `rgba(0, 0, 0, ${settings.opacity / 100})`,
                    borderLeft: `4px solid ${borderColor}`
                }}
            >
                <div className="px-4 py-2">
                    {/* ✅ HEADER ROW: Icono + Tipo + Nombre */}
                    <div
                        className="flex items-center gap-1.5 mb-1.5 text-[10px] font-bold uppercase tracking-wider opacity-80"
                        style={{ color: typeConfig.color }}
                    >
                        <Icon size={12} strokeWidth={2.5} />
                        <span>{typeLabel}</span>
                        <span className="opacity-50">•</span>

                        {!isStreamerMode ? (
                            <span
                                className="font-normal opacity-70"
                                dangerouslySetInnerHTML={{ __html: sanitizedContent.author }}
                            />
                        ) : (
                            <span className="font-normal opacity-70">***</span>
                        )}

                        {/* Tags Extra (Admin, VIP, etc.) */}
                        {message.tags?.map(tag => (
                            <span key={tag} className="text-[9px] px-1 py-0.5 bg-white/10 rounded ml-1">
                                {tag}
                            </span>
                        ))}
                    </div>

                    {/* CUERPO DEL MENSAJE */}
                    <div
                        className="text-white/90 leading-snug break-words font-medium"
                        dangerouslySetInnerHTML={{ __html: sanitizedContent.message }}
                    />
                </div>
            </div>
        </motion.div>
    );
});

MessageBubble.displayName = 'MessageBubble';
