import React, { useRef, useEffect } from 'react';
import { useChatStore } from '../stores/useChatStore';
import type { Message } from '../stores/useChatStore';
import { formatTime } from '../utils/formatTime';
import { sanitizeAndColorize } from '../utils/sanitize';
import classNames from 'classnames';

interface MessageItemProps {
    message: Message;
    streamerMode: boolean;
}

const MessageItem = React.memo(({ message, streamerMode }: MessageItemProps) => {
    const getTagColor = (tag: string): string => {
        if (tag.includes('ADMIN')) return 'bg-red-500';
        if (tag.includes('POLICE')) return 'bg-blue-500';
        if (tag.includes('RP')) return 'bg-purple-500';
        if (tag.includes('ID:')) return 'bg-gray-600';
        return 'bg-gray-500';
    };

    // Sanitize and process FiveM color codes
    const sanitizedMessage = sanitizeAndColorize(message.message);
    const sanitizedAuthor = sanitizeAndColorize(message.author);

    return (
        <div className="flex gap-2 mb-1 text-sm">
            <span className="text-gray-400 text-xs flex-shrink-0">
                {formatTime(message.timestamp)}
            </span>
            {message.tags && message.tags.length > 0 && (
                <div className="flex gap-1 flex-shrink-0">
                    {message.tags.map((tag, idx) => (
                        <span
                            key={idx}
                            className={classNames(
                                'px-1 text-xs rounded font-semibold text-white',
                                getTagColor(tag)
                            )}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}
            <span
                className="text-white font-semibold flex-shrink-0"
                dangerouslySetInnerHTML={{
                    __html: streamerMode ? '***:' : `${sanitizedAuthor}:`
                }}
            />
            <span
                className="text-gray-200 break-words"
                dangerouslySetInnerHTML={{ __html: sanitizedMessage }}
            />
        </div>
    );
});

MessageItem.displayName = 'MessageItem';

export function MessageList() {
    const { messages, activeChannel, settings } = useChatStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Filter messages by active channel
    const filteredMessages = messages.filter((msg) =>
        activeChannel === 'all' ? true : msg.channel === activeChannel
    );

    // Auto-scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [filteredMessages.length]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-3">
            {filteredMessages.length === 0 ? (
                <div className="text-gray-500 text-sm text-center mt-4">
                    No messages in this channel
                </div>
            ) : (
                filteredMessages.map((msg) => (
                    <MessageItem
                        key={msg.id}
                        message={msg}
                        streamerMode={settings.streamerMode}
                    />
                ))
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
