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

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    style={{
                        position: 'fixed',
                        // Posicionamiento alineado a la izquierda (misma X que el chat)
                        left: '20px',
                        top: '50%', // Centrado vertical o configurable
                        width: `${chatWidth}px`, // ANCHO FIJO IMPORTANTE
                        zIndex: 50
                    }}
                    className="pointer-events-auto" // CRÍTICO: Reactiva clicks
                >
                    {/* PATRÓN CONTENEDOR BASE (MIAMI VICE) */}
                    <div className="
                        relative rounded-xl overflow-hidden
                        p-[2px] /* Grosor del borde neón */
                        bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500
                        shadow-[0_0_20px_rgba(236,72,153,0.3)]
                    ">
                        <div className="
                            w-full h-full
                            rounded-xl
                            bg-black/10       /* 10% Transparencia */
                            backdrop-blur-md  /* Efecto Glass */
                            flex items-center gap-2 p-3
                        ">
                            <input
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('ui.input_placeholder')}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/50 text-sm font-medium"
                                style={{ boxShadow: 'none' }} // Prevenir sombras raras
                            />
                            <button onClick={handleSubmit} className="p-1 hover:scale-110 transition text-cyan-400">
                                <Send size={18} />
                            </button>
                            <button onClick={toggleSettingsModal} className="p-1 hover:scale-110 transition text-pink-400">
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>

                    {/* SUGERENCIAS DE COMANDOS (Estilo Unificado) */}
                    <AnimatePresence>
                        {suggestions.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="
                                    mt-2 rounded-lg overflow-hidden
                                    border border-white/10
                                    bg-black/60 backdrop-blur-xl
                                "
                            >
                                {suggestions.map((s) => (
                                    <button
                                        key={s.cmd}
                                        onClick={() => { setInputValue(s.cmd + ' '); setSuggestions([]); inputRef.current?.focus(); }}
                                        className="w-full text-left px-4 py-2 hover:bg-white/10 flex flex-col transition-colors border-b border-white/5 last:border-0"
                                    >
                                        <span className="text-cyan-400 font-bold text-xs">{s.syntax}</span>
                                        <span className="text-gray-300 text-[10px]">{s.desc}</span>
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
