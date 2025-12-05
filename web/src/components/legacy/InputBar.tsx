import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { fetchNui } from '../utils/fetchNui';
import { useTranslation } from '../hooks/useTranslation';
import { useChatStore } from '../stores/useChatStore';

export function InputBar() {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const { isVisible } = useChatStore();
    const { t } = useTranslation();

    // Auto-focus when chat opens
    useEffect(() => {
        if (isVisible) {
            inputRef.current?.focus();
        }
    }, [isVisible]);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            fetchNui('sendMessage', { message: input.trim() });
            setInput('');
        } else if (e.key === 'Escape') {
            fetchNui('close');
            setInput('');
        }
    };

    return (
        <div className="px-4 py-3 border-t border-white/10">
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('ui.input_placeholder', 'Type a message...')}
                className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                maxLength={256}
            />
        </div>
    );
}
