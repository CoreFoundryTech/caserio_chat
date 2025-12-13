import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useChatStore } from '../../stores/useChatStore';
import type { ChatSettings } from '../../stores/useChatStore';
import type { Position } from '../../utils/bubble/positionClasses';
import { useTranslation } from '../../hooks/useTranslation';

const POSITIONS: Position[] = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
];

export function SettingsModal() {
    const { t } = useTranslation();
    const { isSettingsModalOpen, toggleSettingsModal, settings, updateSettings } = useChatStore();
    const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);
    const [isMounted, setIsMounted] = useState(false);
    // const modalOffset = chatWidth + 20; // Unused, removing

    useEffect(() => {
        if (isSettingsModalOpen) {
            setLocalSettings(settings);
            setIsMounted(true);
        } else {
            setIsMounted(false);
        }
    }, [isSettingsModalOpen, settings]);

    const handleSave = () => {
        updateSettings(localSettings);
        toggleSettingsModal();
    };

    // Estilos dinámicos para posicionamiento RELATIVO dentro del ChatContainer
    // El Modal ahora se muestra al lado del chat
    const getModalStyles = (): React.CSSProperties => {
        const pos = settings.position || 'top-left';
        const isRightSide = pos.includes('right');

        return {
            position: 'absolute',
            zIndex: 100,
            width: '300px', // Un poco más ancho
            pointerEvents: 'auto',
            transform: 'translateZ(0)',
            // Si el chat está a la derecha, modal a la izquierda. Si no, a la derecha.
            right: isRightSide ? '105%' : 'auto',
            left: isRightSide ? 'auto' : '105%',
            top: 0
        };
    };

    return (
        <>
            {isSettingsModalOpen && (
                <>
                    {/* Click outside to close (Invisible layer) */}
                    <div onClick={toggleSettingsModal} style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'transparent' }} />

                    <div
                        className="transition-all duration-200 ease-out"
                        style={{
                            ...getModalStyles(),
                            opacity: isMounted ? 1 : 0,
                            transform: isMounted ? 'scale(1) translateX(0)' : 'scale(0.95) translateX(-10px)'
                        }}
                    >
                        {/* MODAL CONTAINER - DARK PASTEL */}
                        <div
                            className="relative rounded-xl overflow-hidden"
                            style={{
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                // ✅ TEMA DARK PASTEL
                                background: 'rgba(20, 20, 30, 0.95)',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                transform: 'translateZ(0)',
                            }}
                        >
                            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                                    <span style={{ color: 'white', fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {t('ui.settings.edit_chat')}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleSettingsModal(); }}
                                        className="hover:rotate-90 transition-transform duration-300"
                                        style={{ color: 'rgba(255,255,255,0.7)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                                    {/* 🔴 STREAMER MODE */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>Modo Streamer</div>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Ocultar nombres reales</div>
                                        </div>
                                        {/* Toggle Switch */}
                                        <button
                                            onClick={() => setLocalSettings(prev => ({ ...prev, streamerMode: !prev.streamerMode }))}
                                            style={{
                                                width: '44px',
                                                height: '24px',
                                                borderRadius: '99px',
                                                background: localSettings.streamerMode ? '#10b981' : 'rgba(255,255,255,0.1)',
                                                position: 'relative',
                                                transition: 'background 0.2s',
                                                cursor: 'pointer',
                                                border: 'none'
                                            }}
                                        >
                                            <div style={{
                                                width: '18px',
                                                height: '18px',
                                                background: 'white',
                                                borderRadius: '50%',
                                                position: 'absolute',
                                                top: '3px',
                                                left: localSettings.streamerMode ? '23px' : '3px',
                                                transition: 'left 0.2s',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                            }} />
                                        </button>
                                    </div>

                                    {/* Position Grid */}
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                                            {t('ui.settings.position')}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
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
                                                        <div style={{ width: '12px', height: '6px', borderRadius: '2px', background: 'white', boxShadow: '0 0 8px white' }} />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Size Selector */}
                                    <div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                                            {t('ui.settings.size')}
                                        </div>
                                        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                            {(['small', 'medium', 'large'] as const).map((size) => (
                                                <button key={size} onClick={() => setLocalSettings(prev => ({ ...prev, scale: size }))}
                                                    style={{
                                                        flex: 1, padding: '10px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', border: 'none',
                                                        textTransform: 'uppercase', fontWeight: 'bold',
                                                        background: localSettings.scale === size ? 'white' : 'transparent',
                                                        color: localSettings.scale === size ? '#111827' : 'rgba(255,255,255,0.6)',
                                                    }}
                                                >
                                                    {t(`ui.settings.${size}`)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                {/* Footer Save Button */}
                                <div style={{ paddingTop: '10px' }}>
                                    <button onClick={handleSave}
                                        style={{
                                            width: '100%', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                            background: '#3b82f6', // Azul profesional
                                            color: 'white', fontWeight: 'bold', fontSize: '14px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                        }}
                                        className="hover:brightness-110 active:scale-[0.98] transition-all"
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
