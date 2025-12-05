import { useState } from 'react';
import { useChatStore } from '../stores/useChatStore';
import { useTranslation } from '../hooks/useTranslation';
import { Settings as SettingsIcon } from 'lucide-react';

export function Settings() {
    const [isOpen, setIsOpen] = useState(false);
    const { settings, updateSettings } = useChatStore();
    const { t, locale, setLocale } = useTranslation();

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                title="Settings"
            >
                <SettingsIcon size={18} />
            </button>
        );
    }

    return (
        <div className="absolute top-0 right-0 w-64 bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-lg p-4 m-2 shadow-xl z-10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-semibold">
                    {t('ui.settings.title', 'Chat Settings')}
                </h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-white"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-4">
                {/* Opacity */}
                <div>
                    <label className="text-sm text-gray-300 block mb-1">
                        {t('ui.settings.opacity', 'Background Opacity')}
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.opacity}
                        onChange={(e) => updateSettings({ opacity: parseInt(e.target.value) })}
                        className="w-full"
                    />
                    <span className="text-xs text-gray-400">{settings.opacity}%</span>
                </div>

                {/* Font Size */}
                <div>
                    <label className="text-sm text-gray-300 block mb-1">
                        {t('ui.settings.font_size', 'Font Size')}
                    </label>
                    <input
                        type="range"
                        min="12"
                        max="20"
                        value={settings.fontSize}
                        onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                        className="w-full"
                    />
                    <span className="text-xs text-gray-400">{settings.fontSize}px</span>
                </div>

                {/* Streamer Mode */}
                <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-300">
                        {t('ui.settings.streamer_mode', 'Streamer Mode')}
                    </label>
                    <input
                        type="checkbox"
                        checked={settings.streamerMode}
                        onChange={(e) => updateSettings({ streamerMode: e.target.checked })}
                        className="w-4 h-4"
                    />
                </div>

                {/* Language */}
                <div>
                    <label className="text-sm text-gray-300 block mb-1">
                        {t('ui.settings.language', 'Language')}
                    </label>
                    <select
                        value={locale}
                        onChange={(e) => setLocale(e.target.value as 'en' | 'es')}
                        className="w-full bg-gray-800 text-white rounded px-2 py-1 text-sm"
                    >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
