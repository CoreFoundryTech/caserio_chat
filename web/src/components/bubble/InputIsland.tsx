import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { Send, Settings, Smile } from 'lucide-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { useChatStore } from '../../stores/useChatStore';
import { fetchNui } from '../../utils/fetchNui';
import { useTranslation } from '../../hooks/useTranslation';

// DYNAMIC IMPORT: Emoji picker solo se carga cuando el usuario lo abre
const EmojiPicker = lazy(() => import('emoji-picker-react'));

export const CHAT_SIZES = {
    small: 350,
    medium: 420,
    large: 500,
};

export function InputIsland() {
    const { t } = useTranslation();
    const { isVisible, settings, toggleSettingsModal } = useChatStore();
    const [inputValue, setInputValue] = useState('');
    const [isMounted, setIsMounted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // NUEVOS ESTADOS PARA HISTORIAL
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // OBTENER SUGERENCIAS DINÁMICAS DEL STORE
    const suggestionsList = useChatStore((state) => state.suggestions);

    // Tipo para sugerencias locales (UI)
    interface LocalSuggestion {
        cmd: string;
        syntax: string;
        desc: string;
    }
    const [suggestions, setSuggestions] = useState<LocalSuggestion[]>([]);

    // ESTADO PARA EMOJI PICKER
    const [showEmojis, setShowEmojis] = useState(false);

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

            // CIERRE INTELIGENTE: Si emoji picker está abierto, cerrarlo primero
            if (e.key === 'Escape') {
                e.preventDefault();
                if (showEmojis) {
                    setShowEmojis(false); // Cerrar picker primero
                } else {
                    fetchNui('close'); // Cerrar chat
                }
            }
            if ((e.key === 't' || e.key === 'T') && document.activeElement !== inputRef.current) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isVisible, showEmojis]); // Agregar showEmojis a dependencias

    useEffect(() => {
        if (inputValue.startsWith('/')) {
            const query = inputValue.toLowerCase().split(' ')[0];

            // Mostrar si escribes al menos 1 caracter después del /
            if (query.length >= 1) {
                // Filtrar lista real del store
                const matches = suggestionsList
                    .filter(c => c.name.toLowerCase().startsWith(query))
                    .slice(0, 5);

                // Formatear para la UI
                setSuggestions(matches.map(s => ({
                    cmd: s.name,
                    // Crea una sintaxis bonita: /comando [id] [razón]
                    syntax: `${s.name} ${s.params ? s.params.map(p => `[${p.name}]`).join(' ') : ''}`,
                    desc: s.help
                })));
            } else {
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
        }
    }, [inputValue, suggestionsList]); // Agrega suggestionsList a dependencias

    const handleSubmit = async () => {
        if (!inputValue.trim()) return;

        // 1. Guardar en historial (evitando duplicados seguidos)
        setHistory(prev => {
            // Si es igual al último, no lo guardes de nuevo
            if (prev.length > 0 && prev[0] === inputValue) return prev;
            return [inputValue, ...prev].slice(0, 50); // Máximo 50 comandos
        });
        setHistoryIndex(-1); // Resetear posición

        try {
            await fetchNui('sendMessage', { message: inputValue });
            setInputValue('');
            setSuggestions([]);
            inputRef.current?.focus();
        } catch { }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }

        // LÓGICA FLECHAS HISTORIAL
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (history.length > 0) {
                const nextIndex = Math.min(historyIndex + 1, history.length - 1);
                setHistoryIndex(nextIndex);
                setInputValue(history[nextIndex]);
                // Mover cursor al final (pequeño truco de UX)
                setTimeout(() => {
                    if (inputRef.current) {
                        inputRef.current.selectionStart = inputRef.current.selectionEnd = history[nextIndex].length;
                    }
                }, 0);
            }
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex > 0) {
                const nextIndex = historyIndex - 1;
                setHistoryIndex(nextIndex);
                setInputValue(history[nextIndex]);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInputValue('');
            }
        }

        if (e.key === 'Tab' && suggestions.length > 0) {
            e.preventDefault();
            const currentCmd = inputValue.split(' ')[0];
            if (currentCmd.toLowerCase() !== suggestions[0].cmd.toLowerCase()) {
                setInputValue(suggestions[0].cmd + ' ');
            }
        }
    };

    // MANEJADOR DE EMOJIS
    const onEmojiClick = (emojiData: EmojiClickData) => {
        setInputValue(prev => prev + emojiData.emoji);
        // No cerramos el picker para permitir selección múltiple
        inputRef.current?.focus();
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
                                maxLength={255}  // ✅ UX: Visual feedback antes de validación server
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/70 text-base font-medium"
                                style={{ boxShadow: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}
                            />
                            <button
                                onClick={() => setShowEmojis(!showEmojis)}
                                className="p-1 hover:scale-110 transition text-white/90"
                                title="Emojis"
                            >
                                <Smile size={20} />
                            </button>
                            <button onClick={handleSubmit} className="p-1 hover:scale-110 transition text-white/90">
                                <Send size={20} />
                            </button>
                            <button onClick={toggleSettingsModal} className="p-1 hover:scale-110 transition text-white/90">
                                <Settings size={20} />
                            </button>
                        </div>
                    </div>

                    {/* EMOJI PICKER */}
                    {showEmojis && (
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '100%',
                                left: 0,
                                marginBottom: '10px',
                                zIndex: 100
                            }}
                        >
                            <Suspense fallback={
                                <div style={{
                                    width: chatWidth,
                                    height: 350,
                                    background: 'rgba(0,0,0,0.8)',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    Cargando emojis...
                                </div>
                            }>
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    theme={'dark' as any}
                                    width={chatWidth}
                                    height={350}
                                    lazyLoadEmojis={true}
                                />
                            </Suspense>
                        </div>
                    )}

                    {/* SUGGESTIONS - Solo mostrar si el emoji picker NO está abierto */}
                    {suggestions.length > 0 && !showEmojis && (
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
