import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useChatStore } from '../../stores/useChatStore';
import type { ChatSettings } from '../../stores/useChatStore';
import { COLORS } from '../../utils/bubble/colorPalette';
import type { Position } from '../../utils/bubble/positionClasses';
import classNames from 'classnames';
import { useTranslation } from '../../hooks/useTranslation';

const POSITIONS: Position[] = [
    'top-left', 'top-center', 'top-right',
    'center-left', 'center', 'center-right',
    'bottom-left', 'bottom-center', 'bottom-right'
];

export function SettingsModal() {
    const { t } = useTranslation();
    const { isSettingsModalOpen, toggleSettingsModal, settings, updateSettings } = useChatStore();

    // Local state for preview before saving
    const [localSettings, setLocalSettings] = useState<ChatSettings>(settings);

    // Sync local state when modal opens
    useEffect(() => {
        if (isSettingsModalOpen) {
            setLocalSettings(settings);
        }
    }, [isSettingsModalOpen, settings]);

    const handleSave = () => {
        updateSettings(localSettings);
        toggleSettingsModal();
    };

    const handleCancel = () => {
        setLocalSettings(settings); // Revert
        toggleSettingsModal();
    };

    return (
        <AnimatePresence>
            {isSettingsModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleCancel} // Click outside to close
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="relative w-full max-w-[500px] bg-[#1a1a1a] rounded-2xl shadow-2xl overflow-hidden border border-white/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-white tracking-tight">{t('ui.settings.edit_chat')}</h2>
                                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{t('ui.settings.appearance')}</p>
                            </div>
                            <button
                                onClick={handleCancel}
                                className="p-2 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">

                            {/* SECTION 1: MAIN COLOR */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('ui.settings.main_color')}</h3>
                                    <div
                                        className="w-6 h-6 rounded-full shadow-inner"
                                        style={{ backgroundColor: localSettings.primaryColor }}
                                    />
                                </div>
                                <div className="grid grid-cols-8 gap-3">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setLocalSettings(prev => ({ ...prev, primaryColor: color }))}
                                            className={classNames(
                                                "w-full aspect-square rounded-lg shadow-sm transition-all hover:scale-110",
                                                localSettings.primaryColor === color ? "ring-2 ring-white scale-110 z-10" : "hover:ring-2 hover:ring-white/20"
                                            )}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* SECTION 2: POSITION */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('ui.settings.position')}</h3>
                                    <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded">
                                        {localSettings.position?.replace(/-/g, ' ').toUpperCase() || 'TOP LEFT'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-3 aspect-video bg-black/20 p-4 rounded-xl border border-white/5">
                                    {POSITIONS.map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => setLocalSettings(prev => ({ ...prev, position: pos }))}
                                            className={classNames(
                                                "rounded-lg border-2 transition-all relative group",
                                                localSettings.position === pos
                                                    ? "border-white bg-white/10"
                                                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                                            )}
                                        >
                                            {/* Visual indicator inside the box */}
                                            <div className={classNames(
                                                "absolute w-2 h-2 rounded-full transition-all",
                                                pos.includes('top') ? "top-2" : pos.includes('bottom') ? "bottom-2" : "top-1/2 -translate-y-1/2",
                                                pos.includes('left') ? "left-2" : pos.includes('right') ? "right-2" : "left-1/2 -translate-x-1/2",
                                                localSettings.position === pos
                                                    ? "bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                                    : "bg-white/10 group-hover:bg-white/30"
                                            )} />
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* SECTION 3: SIZE */}
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{t('ui.settings.size')}</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-lg">
                                    {(['small', 'medium', 'large'] as const).map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setLocalSettings(prev => ({ ...prev, scale: size }))}
                                            className={classNames(
                                                "py-2 text-sm font-medium rounded-md transition-all capitalize",
                                                localSettings.scale === size
                                                    ? "text-white shadow-md"
                                                    : "text-white/40 hover:text-white/70"
                                            )}
                                            style={{
                                                backgroundColor: localSettings.scale === size ? localSettings.primaryColor : 'transparent'
                                            }}
                                        >
                                            {t(`ui.settings.${size}`)}
                                        </button>
                                    ))}
                                </div>
                            </section>

                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-black/20 flex gap-3">
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-colors uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                            >
                                <Check size={16} strokeWidth={3} />
                                {t('ui.settings.save_changes')}
                            </button>
                            <button
                                onClick={handleCancel}
                                className="flex-1 py-3 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors uppercase tracking-wide text-sm"
                            >
                                {t('ui.settings.close')}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
