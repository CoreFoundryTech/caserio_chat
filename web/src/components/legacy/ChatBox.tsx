import { useRef } from 'react';
import Draggable from 'react-draggable';
import { useChatStore } from '../stores/useChatStore';
import { useNuiEvent } from '../hooks/useNuiEvent';
import { Channels } from './Channels';
import { MessageList } from './MessageList';
import { InputBar } from './InputBar';
import { Settings } from './Settings';
import type { Message } from '../stores/useChatStore';

export function ChatBox() {
    const { isVisible, toggleVisibility, addMessage, settings } = useChatStore();
    const nodeRef = useRef<HTMLDivElement>(null); // For React 18 compatibility

    // Listen for visibility toggle from Lua
    useNuiEvent<boolean>('TOGGLE_VISIBILITY', (visible) => {
        toggleVisibility(visible);
    });

    // Listen for new messages from Lua
    useNuiEvent<Message>('ADD_MESSAGE', (payload) => {
        addMessage(payload);
    });

    if (!isVisible) return null;

    const containerStyle = {
        fontSize: `${settings.fontSize}px`,
        backgroundColor: `rgba(17, 24, 39, ${settings.opacity / 100})`,
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            bounds="parent"
            handle=".drag-handle"
            defaultPosition={{ x: 20, y: 100 }}
        >
            <div
                ref={nodeRef}
                className="absolute w-[600px] h-[400px] backdrop-blur-md border border-white/10 rounded-lg shadow-2xl flex flex-col"
                style={containerStyle}
            >
                {/* Drag Handle */}
                <div className="drag-handle cursor-move px-4 py-2 border-b border-white/10 flex items-center">
                    <div className="flex-1 text-white font-semibold text-sm">
                        Caserio Chat
                    </div>
                    <div className="text-gray-400 text-xs">
                        Drag to move
                    </div>
                </div>

                {/* Settings Button */}
                <Settings />

                {/* Channel Tabs */}
                <Channels />

                {/* Message List */}
                <MessageList />

                {/* Input Bar */}
                <InputBar />
            </div>
        </Draggable>
    );
}
