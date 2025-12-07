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

export interface Message {
    id: string;
    type?: 'me' | 'do' | 'radio' | 'police' | 'ems' | 'system' | 'job'; // ✅ NUEVO: Para headers visuales
    channel: string;
    author: string;
    message: string;
    tags?: string[];
    timestamp: number;
}

interface ChatState {
    messages: Message[];
    activeChannel: string;
    isVisible: boolean;
    isSettingsModalOpen: boolean;
    settings: ChatSettings;

    addMessage: (msg: Message) => void;
    setActiveChannel: (channel: string) => void;
    toggleVisibility: (force?: boolean) => void;
    toggleSettingsModal: () => void;
    updateSettings: (settings: Partial<ChatSettings>) => void;
}

export const useChatStore = create<ChatState>()(persist(
    (set) => ({
        messages: [],
        activeChannel: 'all',
        isVisible: import.meta.env.DEV, // Visible by default in dev mode
        isSettingsModalOpen: false,
        settings: {
            opacity: 80,
            fontSize: 14,
            streamerMode: false,
            position: 'top-right',
            scale: 'medium',
            primaryColor: '#F97316', // Orange from reference
        },

        addMessage: (msg) => set((state) => ({
            messages: [...state.messages, msg].slice(-100) // Keep last 100
        })),
        setActiveChannel: (ch) => set({ activeChannel: ch }),
        toggleVisibility: (val) => set((state) => ({ isVisible: val ?? !state.isVisible })),
        toggleSettingsModal: () => set((state) => ({ isSettingsModalOpen: !state.isSettingsModalOpen })),
        updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } }))
    }),
    {
        name: 'caserio-chat-storage',
        version: 3, // Increment version
        partialize: (state) => ({
            settings: state.settings,
            // Don't persist messages or isVisible
        }),
        migrate: (persistedState: any) => {
            return persistedState;
        }
    }
));
