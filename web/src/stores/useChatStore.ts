import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatSettings {
    opacity: number;
    fontSize: number; // Deprecated, kept for backward compatibility if needed, replaced by scale
    streamerMode: boolean;

    // New Bubble Chat Settings
    position: 'top-left' | 'top-center' | 'top-right' |
    'center-left' | 'center' | 'center-right' |
    'bottom-left' | 'bottom-center' | 'bottom-right';
    scale: 'small' | 'medium' | 'large';
    primaryColor: string;
}

export interface CommandSuggestion {
    name: string;
    help: string;
    params?: { name: string; help: string }[];
}

export interface Message {
    id: string;
    type?: 'me' | 'do' | 'radio' | 'police' | 'ems' | 'system' | 'job';
    channel: string;
    author: string;
    message: string;
    tags?: string[];
    timestamp: number;
    isMention?: boolean; // Para resaltado visual de menciones
}

interface ChatState {
    messages: Message[];
    activeChannel: string;
    isVisible: boolean;
    isSettingsModalOpen: boolean;
    settings: ChatSettings;
    suggestions: CommandSuggestion[];

    // ✅ NUEVO: Contador de mensajes no leídos
    unreadCounts: Record<string, number>;

    addMessage: (msg: Message) => void;
    setActiveChannel: (channel: string) => void;
    toggleVisibility: (force?: boolean) => void;
    toggleSettingsModal: () => void;
    updateSettings: (settings: Partial<ChatSettings>) => void;
    addSuggestion: (suggestion: CommandSuggestion) => void;
    removeSuggestion: (name: string) => void;
}

export const useChatStore = create<ChatState>()(persist(
    (set) => ({
        messages: [],
        activeChannel: 'all',
        isVisible: import.meta.env.DEV, // Visible by default in dev mode
        isSettingsModalOpen: false,
        suggestions: [],
        // ✅ Inicializar contadores vacíos
        unreadCounts: {},
        settings: {
            opacity: 80,
            fontSize: 14,
            streamerMode: false,
            position: 'top-right',
            scale: 'medium',
            primaryColor: '#F97316', // Orange from reference
        },

        addMessage: (msg) => set((state) => {
            // ✅ Lógica de Badges:
            // Si el mensaje NO es del canal actual Y no estamos viendo "Todos"
            // incrementamos el contador para ese canal.
            const newUnreads = { ...state.unreadCounts };
            if (state.activeChannel !== 'all' && state.activeChannel !== msg.channel) {
                newUnreads[msg.channel] = (newUnreads[msg.channel] || 0) + 1;
            }

            return {
                messages: [...state.messages, msg].slice(-100),
                unreadCounts: newUnreads
            };
        }),
        setActiveChannel: (ch) => set((state) => {
            // ✅ Al cambiar de canal, reseteamos sus no leídos
            const newUnreads = { ...state.unreadCounts };

            if (ch === 'all') {
                // Si vamos a "Todos", limpiar todos los contadores
                for (const key in newUnreads) newUnreads[key] = 0;
            } else {
                newUnreads[ch] = 0;
            }

            return {
                activeChannel: ch,
                unreadCounts: newUnreads
            };
        }),
        toggleVisibility: (val) => set((state) => ({ isVisible: val ?? !state.isVisible })),
        toggleSettingsModal: () => set((state) => ({ isSettingsModalOpen: !state.isSettingsModalOpen })),
        updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),

        // NUEVAS ACCIONES
        addSuggestion: (s) => set((state) => {
            // Prevenir duplicados
            if (state.suggestions.some(x => x.name === s.name)) return state;
            return { suggestions: [...state.suggestions, s] };
        }),
        removeSuggestion: (name) => set((state) => ({
            suggestions: state.suggestions.filter(s => s.name !== name)
        })),
    }),
    {
        name: 'caserio-chat-storage',
        version: 4, // Incrementamos versión por el nuevo campo
        partialize: (state) => ({
            settings: state.settings,
            // Don't persist messages or isVisible
        }),
        migrate: (persistedState: any) => {
            return persistedState;
        }
    }
));
