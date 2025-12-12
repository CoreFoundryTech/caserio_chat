import { useState, useEffect } from 'react';
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
    const [isMounted, setIsMounted] = useState(false);

    const chatWidth = CHAT_SIZES[settings.scale] || CHAT_SIZES.medium;
    const modalOffset = chatWidth + 30;

    useEffect(() => {
        if (isSettingsModalOpen) {
            setLocalSettings(settings);
            setIsMounted(true);
        } else {
            setIsMounted(false);
        }
    }, [isSettingsModalOpen, settings]);

    const handleSave = () => { updateSettings(localSettings); toggleSettingsModal(); };

    const getModalStyles = (): React.CSSProperties => {
        const pos = settings.position || 'top-left';
        const base: React.CSSProperties = {
            position: 'fixed',
            zIndex: 100,
            width: '280px', // Un poco más ancho
            pointerEvents: 'auto',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden'
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
        <>
            {isSettingsModalOpen && (
                <>
                    {/* Click outside to close */}
                    <div onClick={toggleSettingsModal} style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'transparent' }} />

                    <div
                        className="transition-all duration-150 ease-out"
                        style={{
                            ...getModalStyles(),
                            opacity: isMounted ? 1 : 0,
                            transform: isMounted ? 'scale(1)' : 'scale(0.95)'
                        }}
                    >
                        {/* MODAL MATCHING SCREENSHOT */}
                        <div
                            className="relative rounded-2xl overflow-hidden shadow-2xl"
                            style={{
                                // Gradiente Vertical Rosa->Celeste como en la foto
                                background: 'linear-gradient(to bottom, #ec4899, #8b5cf6, #3b82f6)',
                                transform: 'translateZ(0)'
                            }}
                        >
                            {/* Glass Content Overlay */}
                            <div style={{
                                background: 'rgba(255, 255, 255, 0.15)', // Light overlay
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                            }}>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                                    <span style={{ color: 'white', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                                        {t('ui.settings.edit_chat')}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSettingsModal(); }}
                                        className="hover:rotate-90 transition-transform duration-300"
                                        style={{ color: 'white', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

                                    {/* Colors */}
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                                            {t('ui.settings.main_color')}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                                            {COLORS.map((color) => (
                                                <button key={color} onClick={() => setLocalSettings(prev => ({ ...prev, primaryColor: color }))}
                                                    style={{
                                                        aspectRatio: '1', borderRadius: '6px', cursor: 'pointer', backgroundColor: color, border: '2px solid white',
                                                        transform: localSettings.primaryColor === color ? 'scale(1.15)' : 'scale(1)',
                                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                                                        transition: 'transform 0.2s'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Position */}
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                                            {t('ui.settings.position')}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                            {POSITIONS.map((pos) => (
                                                <button key={pos} onClick={() => setLocalSettings(prev => ({ ...prev, position: pos }))}
                                                    style={{
                                                        aspectRatio: '16/9', borderRadius: '6px', cursor: 'pointer', border: 'none',
                                                        background: localSettings.position === pos ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                                                        position: 'relative',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                >
                                                    {localSettings.position === pos && (
                                                        <div style={{ width: '16px', height: '6px', borderRadius: '3px', background: 'white', boxShadow: '0 0 5px white' }} />
                                                    )}
                                                    {localSettings.position !== pos && (
                                                        <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.3)' }} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Size */}
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                                            {t('ui.settings.size')}
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                            {(['small', 'medium', 'large'] as const).map((size) => (
                                                <button key={size} onClick={() => setLocalSettings(prev => ({ ...prev, scale: size }))}
                                                    style={{
                                                        flex: 1, padding: '10px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', border: 'none',
                                                        textTransform: 'uppercase', fontWeight: 'bold',
                                                        background: localSettings.scale === size ? 'white' : 'transparent',
                                                        color: localSettings.scale === size ? '#ec4899' : 'rgba(255,255,255,0.6)',
                                                        boxShadow: localSettings.scale === size ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                                                    }}
                                                >
                                                    {t(`ui.settings.${size}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div style={{ padding: '20px', paddingTop: '0' }}>
                                    <button onClick={handleSave}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                            background: 'linear-gradient(to bottom, #dc2626, #b91c1c)',
                                            color: 'white', fontWeight: 'bold', fontSize: '14px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                            textShadow: '0 1px 1px rgba(0,0,0,0.3)'
                                        }}
                                        className="hover:scale-[1.02] active:scale-[0.98] transition-transform"
                                    >
                                        <Check size={18} />
                                        {t('ui.settings.save_changes')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
