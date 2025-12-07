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

// Tamaños - MISMO para chat e input
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
    const modalOffset = chatWidth + 30; // 30px de margen

    useEffect(() => {
        if (isSettingsModalOpen) setLocalSettings(settings);
    }, [isSettingsModalOpen, settings]);

    const handleSave = () => { updateSettings(localSettings); toggleSettingsModal(); };

    const getModalStyles = (): React.CSSProperties => {
        const pos = settings.position || 'top-left';
        const base: React.CSSProperties = { position: 'fixed', zIndex: 100, width: '200px' };

        if (pos.includes('left')) base.left = `${modalOffset}px`;
        else if (pos.includes('right')) base.right = `${modalOffset}px`;
        else base.left = `calc(50% + ${chatWidth / 2 + 20}px)`;

        if (pos.includes('top')) base.top = '10px';
        else if (pos.includes('bottom')) base.bottom = '60px';
        else base.top = '20%';

        return base;
    };

    return (
        <AnimatePresence>
            {isSettingsModalOpen && (
                <>
                    <div onClick={toggleSettingsModal} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        style={{
                            ...getModalStyles(),
                            backgroundColor: 'rgba(10, 10, 10, 0.8)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            <span style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>{t('ui.settings.edit_chat')}</span>
                            <button onClick={toggleSettingsModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.5 }}>
                                <X size={14} color="white" />
                            </button>
                        </div>

                        <div style={{ padding: '12px' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {t('ui.settings.main_color')}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '3px' }}>
                                    {COLORS.map((color) => (
                                        <button key={color} onClick={() => setLocalSettings(prev => ({ ...prev, primaryColor: color }))}
                                            style={{
                                                aspectRatio: '1', backgroundColor: color, borderRadius: '4px', cursor: 'pointer',
                                                border: localSettings.primaryColor === color ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                                            }} />
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {t('ui.settings.position')}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px', padding: '6px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    {POSITIONS.map((pos) => (
                                        <button key={pos} onClick={() => setLocalSettings(prev => ({ ...prev, position: pos }))}
                                            style={{
                                                aspectRatio: '16/9', borderRadius: '4px', cursor: 'pointer', border: 'none',
                                                backgroundColor: localSettings.position === pos ? localSettings.primaryColor : 'rgba(255,255,255,0.05)',
                                            }} />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                    {t('ui.settings.size')}
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {(['small', 'medium', 'large'] as const).map((size) => (
                                        <button key={size} onClick={() => setLocalSettings(prev => ({ ...prev, scale: size }))}
                                            style={{
                                                flex: 1, padding: '6px', fontSize: '10px', borderRadius: '6px', cursor: 'pointer', border: 'none',
                                                fontWeight: localSettings.scale === size ? 600 : 400, color: 'white', textTransform: 'capitalize',
                                                backgroundColor: localSettings.scale === size ? localSettings.primaryColor : 'rgba(255,255,255,0.05)',
                                            }}>
                                            {t(`ui.settings.${size}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                            <button onClick={handleSave} style={{
                                width: '100%', padding: '8px', fontSize: '11px', fontWeight: 600, borderRadius: '8px',
                                backgroundColor: 'white', color: 'black', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                            }}>
                                <Check size={12} />
                                {t('ui.settings.save_changes')}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
