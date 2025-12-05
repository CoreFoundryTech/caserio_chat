import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Settings, Smile } from 'lucide-react';
import { useChatStore } from '../../stores/useChatStore';
import { fetchNui } from '../../utils/fetchNui';

export function InputIsland() {
    const { isVisible, settings, toggleSettingsModal } = useChatStore();
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isVisible) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isVisible]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        try {
            await fetchNui('sendMessage', { message: inputValue });
            setInputValue('');
            // Keep focus on input for continuous typing
            inputRef.current?.focus();
        } catch (err) {
            console.error('Failed to send message:', err);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
        if (e.key === 'Escape') {
            fetchNui('closeChat');
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, x: '-50%' }}
                    animate={{ y: 0, opacity: 1, x: '-50%' }}
                    exit={{ y: 100, opacity: 0, x: '-50%' }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="fixed bottom-10 left-1/2 z-50 w-full max-w-[600px] px-4"
                >
                    <div className="relative group">
                        {/* Glass Container */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-xl rounded-full shadow-2xl -z-10 transition-all duration-300 group-hover:bg-black/70" />

                        <div className="flex items-center p-2 gap-2">
                            {/* Emoji Button (Placeholder functionality) */}
                            <button
                                type="button"
                                className="p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                            >
                                <Smile size={20} />
                            </button>

                            {/* Input Field */}
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Message..."
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 text-base font-medium"
                            />

                            {/* Action Buttons Container */}
                            <div className="flex items-center gap-2">
                                {/* Send Button */}
                                <button
                                    onClick={() => handleSubmit()}
                                    className="p-2.5 rounded-full text-white shadow-lg transform transition-all active:scale-95 hover:brightness-110"
                                    style={{ backgroundColor: settings.primaryColor }}
                                >
                                    <Send size={18} fill="currentColor" />
                                </button>

                                {/* Settings Button */}
                                <button
                                    onClick={toggleSettingsModal}
                                    className="p-2.5 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                                >
                                    <Settings size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Helper Text */}
                    <div className="text-center mt-2 text-xs text-white/30 font-medium tracking-wide">
                        PRESS <span className="font-bold text-white/50">ESC</span> TO CANCEL
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
