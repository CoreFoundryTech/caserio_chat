import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Settings } from 'lucide-react';
import { useChatStore } from '../../stores/useChatStore';
import { fetchNui } from '../../utils/fetchNui';
import { useTranslation } from '../../hooks/useTranslation';

const AVAILABLE_COMMANDS = [
    { cmd: '/me', syntax: '/me [acción]', desc: 'Acción de roleplay' },
    { cmd: '/do', syntax: '/do [descripción]', desc: 'Descripción de entorno' },
    { cmd: '/ooc', syntax: '/ooc [mensaje]', desc: 'Fuera de personaje' },
    { cmd: '/looc', syntax: '/looc [mensaje]', desc: 'OOC local' },
    { cmd: '/twitter', syntax: '/twitter [tweet]', desc: 'Publicar en Twitter' },
    { cmd: '/twt', syntax: '/twt [tweet]', desc: 'Twitter (corto)' },
    { cmd: '/ad', syntax: '/ad [anuncio]', desc: 'Anuncio público' },
    { cmd: '/news', syntax: '/news [noticia]', desc: 'Noticia de prensa' },
    { cmd: '/police', syntax: '/police [mensaje]', desc: 'Canal de policía' },
    { cmd: '/ems', syntax: '/ems [mensaje]', desc: 'Canal de emergencias' },
    { cmd: '/admin', syntax: '/admin [mensaje]', desc: 'Canal de admin' },
    { cmd: '/report', syntax: '/report [descripción]', desc: 'Reportar problema' },
    { cmd: '/giveitem', syntax: '/giveitem [id] [item] [cant]', desc: 'Dar item' },
    { cmd: '/givemoney', syntax: '/givemoney [id] [tipo] [cant]', desc: 'Dar dinero' },
    { cmd: '/setjob', syntax: '/setjob [id] [job] [grade]', desc: 'Asignar trabajo' },
    { cmd: '/goto', syntax: '/goto [id]', desc: 'Ir a jugador' },
    { cmd: '/bring', syntax: '/bring [id]', desc: 'Traer jugador' },
    { cmd: '/tp', syntax: '/tp [x] [y] [z]', desc: 'Teleport' },
    { cmd: '/tpm', syntax: '/tpm', desc: 'TP a marcador' },
    { cmd: '/noclip', syntax: '/noclip', desc: 'Noclip' },
    { cmd: '/car', syntax: '/car [modelo]', desc: 'Spawn vehículo' },
    { cmd: '/dv', syntax: '/dv', desc: 'Eliminar vehículo' },
    { cmd: '/revive', syntax: '/revive [id]', desc: 'Revivir' },
    { cmd: '/heal', syntax: '/heal [id]', desc: 'Curar' },
    { cmd: '/kick', syntax: '/kick [id] [razón]', desc: 'Expulsar' },
    { cmd: '/ban', syntax: '/ban [id] [tiempo] [razón]', desc: 'Banear' },
    { cmd: '/txadmin', syntax: '/txadmin', desc: 'Panel txAdmin' },
    { cmd: '/tx', syntax: '/tx', desc: 'txAdmin corto' },
    { cmd: '/id', syntax: '/id', desc: 'Ver tu ID' },
    { cmd: '/clear', syntax: '/clear', desc: 'Limpiar chat' },
];

// Tamaños - MISMO para chat e input
export const CHAT_SIZES = {
    small: 350,
    medium: 420,
    large: 500,
};

export function InputIsland() {
    const { t } = useTranslation();
    const { isVisible, settings, toggleSettingsModal } = useChatStore();
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<typeof AVAILABLE_COMMANDS>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const chatWidth = CHAT_SIZES[settings.scale] || CHAT_SIZES.medium;

    useEffect(() => {
        if (isVisible) setTimeout(() => inputRef.current?.focus(), 50);
    }, [isVisible]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isVisible) return;
            if (e.key === 'Escape') { e.preventDefault(); fetchNui('close'); }
            if ((e.key === 't' || e.key === 'T') && document.activeElement !== inputRef.current) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible]);

    useEffect(() => {
        if (inputValue.startsWith('/')) {
            const query = inputValue.toLowerCase().split(' ')[0];
            if (query.length >= 2) {
                setSuggestions(AVAILABLE_COMMANDS.filter(c => c.cmd.toLowerCase().startsWith(query)).slice(0, 5));
            } else {
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    }, [inputValue]);

    const handleSubmit = async () => {
        if (!inputValue.trim()) return;
        try {
            await fetchNui('sendMessage', { message: inputValue });
            setInputValue('');
            setSuggestions([]);
            inputRef.current?.focus();
        } catch { }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
        if (e.key === 'Tab' && suggestions.length > 0) {
            e.preventDefault();
            const currentCmd = inputValue.split(' ')[0];
            if (currentCmd.toLowerCase() !== suggestions[0].cmd.toLowerCase()) {
                setInputValue(suggestions[0].cmd + ' ');
            }
        }
    };

    const getPositionStyles = (): React.CSSProperties => {
        const pos = settings.position || 'top-left';
        const base: React.CSSProperties = {
            position: 'fixed',
            zIndex: 50,
            width: `${chatWidth}px`,
        };

        if (pos.includes('left')) base.left = '10px';
        else if (pos.includes('right')) base.right = '10px';
        else { base.left = '50%'; base.transform = 'translateX(-50%)'; }

        if (pos.includes('top')) base.top = '230px';
        else if (pos.includes('bottom')) base.bottom = '10px';
        else base.top = 'calc(20% + 220px)';

        return base;
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={getPositionStyles()}
                >
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px 12px',
                        gap: '8px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(0, 0, 0, 0.65)',
                        backdropFilter: 'blur(12px)',
                    }}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={t('ui.input_placeholder')}
                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '14px', minWidth: 0 }}
                        />
                        <button onClick={handleSubmit} style={{
                            padding: '8px', borderRadius: '8px', backgroundColor: settings.primaryColor,
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Send size={16} color="white" />
                        </button>
                        <button onClick={toggleSettingsModal} style={{
                            padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Settings size={16} color="rgba(255, 255, 255, 0.5)" />
                        </button>
                    </div>

                    <AnimatePresence>
                        {suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.1 }}
                                style={{
                                    marginTop: '6px',
                                    backgroundColor: 'rgba(10, 10, 10, 0.9)',
                                    borderRadius: '10px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                }}
                            >
                                {suggestions.map((s, i) => (
                                    <button
                                        key={s.cmd}
                                        onClick={() => { setInputValue(s.cmd + ' '); setSuggestions([]); inputRef.current?.focus(); }}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                                            width: '100%', padding: '8px 12px',
                                            background: i === 0 ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                                            border: 'none', cursor: 'pointer', textAlign: 'left',
                                            borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                        }}
                                    >
                                        <span style={{ color: settings.primaryColor, fontWeight: 600, fontSize: '12px', fontFamily: 'monospace' }}>
                                            {s.syntax}
                                        </span>
                                        <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '10px', marginTop: '1px' }}>
                                            {s.desc}
                                        </span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
