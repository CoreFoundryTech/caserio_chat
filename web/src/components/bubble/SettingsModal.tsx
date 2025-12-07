import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useChatStore } from '../../stores/useChatStore';
import type { ChatSettings } from '../../stores/useChatStore';
import { COLORS } from '../../utils/bubble/colorPalette';
import type { Position } from '../../utils/bubble/positionClasses';
import { useTranslation } from '../../hooks/useTranslation';

const POSITIONS: Position[] = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
];

const CHAT_SIZES = {
    small: 350,
    medium: 420,
    large: 500,
};

export function SettingsModal() {
    const { t } = useTranslation();
    const { isSettingsModalOpen, toggleSettingsModal, settings, updateSettings } = useChatStore();
    const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);

    const chatWidth = CHAT_SIZES[settings.scale] || CHAT_SIZES.medium;
    const modalOffset = chatWidth + 30;

    useEffect(() => {
        if (isSettingsModalOpen) setLocalSettings(settings);
    }, [isSettingsModalOpen, settings]);

    const handleSave = () => { updateSettings(localSettings); toggleSettingsModal(); };

    const getModalStyles = (): React.CSSProperties => {
        const pos = settings.position || 'top-left';
        const base: React.CSSProperties = {
            position: 'fixed',
            zIndex: 100,
            width: '240px', // Un poco más ancho para comodidad
            pointerEvents: 'auto', // CRÍTICO: Permitir clicks
        };

        if (pos.includes('left')) base.left = `${modalOffset}px`;
        else if (pos.includes('right')) base.right = `${modalOffset}px`;
        else base.left = `calc(50% + ${chatWidth / 2 + 20}px)`;

        if (pos.includes('top')) base.top = '10px';
        else if (pos.includes('bottom')) base.bottom = '80px';
        else base.top = '20%';

        return base;
    };

    return (
        <AnimatePresence>
            {isSettingsModalOpen && (
                <>
                    {/* Click outside to close (Invisible shield) */}
                    <div onClick={toggleSettingsModal} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={getModalStyles()}
                    >
                        {/* Estructura Miami Gradient Border (Igual que InputIsland) */}
                        <div className="relative group rounded-xl p-[1px]">
                            <div className="absolute inset-0 rounded-xl opacity-80 bg-gradient-to-r from-miami-pink via-miami-purple to-miami-cyan"></div>

                            {/* Glass Content */}
                            <div style={{
                                background: 'rgba(0, 0, 0, 0.1)', // 10% Transparencia
                                backdropFilter: 'blur(15px)',
                                borderRadius: '12px',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ color: 'white', fontSize: '13px', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                                        {t('ui.settings.edit_chat')}
                                    </span>
                                    {/* Botón Cerrar Mejorado */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSettingsModal(); }}
                                        style={{
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            color: 'white',
                                            cursor: 'pointer',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'background 0.2s'
                                        }}
                                        className="hover:bg-white/20"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                    {/* Colors */}
                                    <div>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', textShadow: '0 1px 1px black' }}>
                                            {t('ui.settings.main_color')}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
                                            {COLORS.map((color) => (
                                                <button key={color} onClick={() => setLocalSettings(prev => ({ ...prev, primaryColor: color }))}
                                                    style={{
                                                        aspectRatio: '1', borderRadius: '4px', cursor: 'pointer', backgroundColor: color, border: 'none',
                                                        boxShadow: localSettings.primaryColor === color ? '0 0 0 2px white' : '0 2px 4px rgba(0,0,0,0.3)',
                                                        transform: localSettings.primaryColor === color ? 'scale(1.1)' : 'scale(1)'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Position */}
                                    <div>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', textShadow: '0 1px 1px black' }}>
                                            {t('ui.settings.position')}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', padding: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                                            {POSITIONS.map((pos) => (
                                                <button key={pos} onClick={() => setLocalSettings(prev => ({ ...prev, position: pos }))}
                                                    style={{
                                                        aspectRatio: '16/9', borderRadius: '4px', cursor: 'pointer', border: 'none',
                                                        background: localSettings.position === pos ? 'rgba(255,255,255,0.1)' : 'transparent',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{
                                                        width: '12px', height: '6px', borderRadius: '2px', margin: 'auto',
                                                        background: localSettings.position === pos ? localSettings.primaryColor : 'rgba(255,255,255,0.2)',
                                                        boxShadow: localSettings.position === pos ? `0 0 8px ${localSettings.primaryColor}` : 'none'
                                                    }} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Size */}
                                    <div>
                                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', textShadow: '0 1px 1px black' }}>
                                            {t('ui.settings.size')}
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                                            {(['small', 'medium', 'large'] as const).map((size) => (
                                                <button key={size} onClick={() => setLocalSettings(prev => ({ ...prev, scale: size }))}
                                                    style={{
                                                        flex: 1, padding: '8px', fontSize: '10px', borderRadius: '4px', cursor: 'pointer', border: 'none',
                                                        textTransform: 'uppercase', fontWeight: 'bold',
                                                        background: localSettings.scale === size ? 'white' : 'transparent',
                                                        color: localSettings.scale === size ? 'black' : 'rgba(255,255,255,0.5)'
                                                    }}
                                                >
                                                    {t(`ui.settings.${size}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
                                    <button onClick={handleSave}
                                        style={{
                                            width: '100%', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                            background: `linear-gradient(45deg, ${localSettings.primaryColor}, ${localSettings.primaryColor}dd)`,
                                            color: 'white', fontWeight: 'bold', fontSize: '12px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            boxShadow: `0 4px 15px -4px ${localSettings.primaryColor}`,
                                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        <Check size={16} />
                                        {t('ui.settings.save_changes')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
