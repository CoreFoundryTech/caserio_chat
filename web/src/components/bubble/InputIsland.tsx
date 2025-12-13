import { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
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

    // ✅ PERSISTENCIA: Cargar historial desde localStorage
    const loadHistory = () => {
        try {
            const saved = localStorage.getItem('caserio-chat-history');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    };

    const saveHistory = (newHistory: string[]) => {
        try {
            localStorage.setItem('caserio-chat-history', JSON.stringify(newHistory));
        } catch (e) {
            console.error('Failed to save command history', e);
        }
    };

    // Estado para historial de comandos (con persistencia)
    const [history, setHistory] = useState<string[]>(loadHistory);
    const [historyIndex, setHistoryIndex] = useState(-1);

    // Estado para el manejo de emojis
    const [showEmojis, setShowEmojis] = useState(false);

    // ✅ SUGERENCIAS: Obtener del store (vienen del servidor FiveM)
    const suggestions = useChatStore((state) => state.suggestions);

    // Filtrar sugerencias según el input
    const filteredSuggestions = useMemo(() => {
        if (!inputValue.startsWith('/')) return [];
        const query = inputValue.toLowerCase().slice(1);

        // Mapear sugerencias del servidor al formato local
        const mapped = suggestions.map(s => ({
            cmd: s.name,
            syntax: `${s.name} ${s.params ? s.params.map(p => `[${p.name}]`).join(' ') : ''}`,
            desc: s.help
        }));

        if (!query) return mapped; // Mostrar todos si solo escribió "/"

        return mapped.filter(cmd =>
            cmd.cmd.toLowerCase().includes(query) ||
            cmd.desc.toLowerCase().includes(query)
        );
    }, [inputValue, suggestions]);

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
    }, [isVisible, showEmojis]);

    const handleSubmit = async () => {
        if (!inputValue.trim()) return;

        // 1. Guardar en historial (evitando duplicados seguidos)
        setHistory(prev => {
            // Si es igual al último, no lo guardes de nuevo
            if (prev.length > 0 && prev[0] === inputValue) return prev;
            const newHistory = [inputValue, ...prev].slice(0, 50); // Máximo 50 comandos
            saveHistory(newHistory); // ✅ Persistir a localStorage
            return newHistory;
        });
        setHistoryIndex(-1); // Resetear posición

        try {
            await fetchNui('sendMessage', { message: inputValue });
            setInputValue('');
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
            // Flecha Arriba: Navegar al comando anterior
            if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInputValue(history[newIndex]);

                // ✅ UX: Mover cursor al final del input
                setTimeout(() => {
                    const len = history[newIndex].length;
                    inputRef.current?.setSelectionRange(len, len);
                }, 0);
            }
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            // Flecha Abajo: Navegar al comando siguiente o limpiar
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInputValue(history[newIndex]);

                // ✅ UX: Mover cursor al final
                setTimeout(() => {
                    const len = history[newIndex].length;
                    inputRef.current?.setSelectionRange(len, len);
                }, 0);
            } else if (historyIndex === 0) {
                setHistoryIndex(-1);
                setInputValue('');
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
                        position: 'relative', // ✅ RELATIVO A ChatContainer
                        width: `${chatWidth}px`,
                        zIndex: 50,
                        opacity: isMounted ? 1 : 0,
                    }}
                >
                    {/* INPUT ISLAND - DARK PASTEL */}
                    <div
                        className="relative rounded-xl overflow-hidden"
                        style={{
                            padding: '1px', // Borde fino
                            background: 'rgba(255, 255, 255, 0.1)', // Borde sutil
                            transform: 'translateZ(0)',
                        }}
                    >
                        <div
                            className="w-full h-full rounded-[10px] flex items-center gap-3 p-3"
                            style={{
                                // ✅ TEMA DARK PASTEL (Sólido oscuro, sin blur)
                                background: 'rgba(20, 20, 30, 0.85)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)', // Sombra suave permitida ahora
                            }}
                        >
                            <input
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('ui.input_placeholder')}
                                maxLength={255}
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'rgba(255, 255, 255, 1)',
                                    fontSize: '16px',
                                    fontWeight: 500,
                                    boxShadow: 'none',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                                }}
                            />
                            <button
                                onClick={() => setShowEmojis(!showEmojis)}
                                style={{
                                    padding: '4px',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                title="Emojis"
                            >
                                <Smile size={20} />
                            </button>
                            <button
                                onClick={handleSubmit}
                                style={{
                                    padding: '4px',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <Send size={20} />
                            </button>
                            <button
                                onClick={toggleSettingsModal}
                                style={{
                                    padding: '4px',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
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
                    {filteredSuggestions.length > 0 && (
                        <div
                            style={{
                                marginTop: '8px',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.5)', // Sombra más fuerte
                                transition: 'opacity 0.2s',
                                background: 'rgba(20, 20, 30, 0.98)', // Fondo sólido oscuro
                                zIndex: 9999, // ✅ FIX: Z-Index extremo para asegurar visibilidad
                                position: 'relative' // Asegura contexto de apilamiento
                            }}
                        >
                            {filteredSuggestions.slice(0, 5).map((s) => (
                                <button
                                    key={s.cmd}
                                    onClick={() => {
                                        setInputValue(s.syntax.split(' ')[0] + ' '); // Solo el comando base
                                        inputRef.current?.focus();
                                    }}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '12px 16px',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ color: 'rgba(59, 130, 246, 1)', fontWeight: 700, fontSize: '14px' }}>{s.syntax}</span>
                                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>{s.desc}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
