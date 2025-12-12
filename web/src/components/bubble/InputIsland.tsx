import { useState, useRef, useEffect } from 'react';
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
    const [isMounted, setIsMounted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const chatWidth = CHAT_SIZES[settings.scale] || CHAT_SIZES.medium;

    useEffect(() => {
        if (isVisible) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setIsMounted(true);
        } else {
            setIsMounted(false);
        }
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
        <>
            {isVisible && (
                <div
                    className="transition-all duration-200 ease-out pointer-events-auto"
                    style={{
                        position: 'fixed',
                        left: '20px',
                        top: '50%',
                        width: `${chatWidth}px`,
                        zIndex: 50,
                        transform: `translateZ(0) ${isMounted ? 'translateY(0)' : 'translateY(20px)'}`,
                        opacity: isMounted ? 1 : 0,
                    }}
                >
                    {/* INPUT ISLAND MATCHING SCREENSHOT */}
                    <div
                        className="relative rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            padding: '3px',
                            // Gradiente vivo como en la foto
                            background: 'linear-gradient(90deg, #ec4899, #3b82f6, #06b6d4)',
                            transform: 'translateZ(0)',
                        }}
                    >
                        <div
                            className="w-full h-full rounded-[14px] flex items-center gap-3 p-4"
                            style={{
                                // Fondo con tinte de gradiente pero transparente
                                background: 'linear-gradient(90deg, rgba(236,72,153,0.8), rgba(59,130,246,0.8))',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                            }}
                        >
                            <input
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('ui.input_placeholder')}
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/70 text-base font-medium"
                                style={{ boxShadow: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                            />
                            <button onClick={handleSubmit} className="p-1 hover:scale-110 transition text-white/90">
                                <Send size={20} />
                            </button>
                            <button onClick={toggleSettingsModal} className="p-1 hover:scale-110 transition text-white/90">
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>

                    {/* SUGGESTIONS */}
                    {suggestions.length > 0 && (
                        <div
                            className="mt-2 rounded-xl overflow-hidden border border-white/20 shadow-xl transition-opacity duration-200 ease-out"
                            style={{
                                background: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro para sugerencias
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                transform: 'translateZ(0)',
                                opacity: 1,
                            }}
                        >
                                {suggestions.map((s) => (
                                    <button
                                        key={s.cmd}
                                        onClick={() => { setInputValue(s.cmd + ' '); setSuggestions([]); inputRef.current?.focus(); }}
                                        className="w-full text-left px-4 py-3 hover:bg-blue-50 flex flex-col transition-colors border-b border-gray-200 last:border-0"
                                    >
                                        <span className="text-blue-600 font-bold text-sm">{s.syntax}</span>
                                        <span className="text-gray-500 text-xs">{s.desc}</span>
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
