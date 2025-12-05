import { useChatStore } from '../stores/useChatStore';
import { useTranslation } from '../hooks/useTranslation';
import classNames from 'classnames';

const CHANNELS = [
    { id: 'all', icon: '📢' },
    { id: 'system', icon: '⚙️' },
    { id: 'ooc', icon: '💬' },
    { id: 'radio', icon: '📻' },
    { id: 'job', icon: '💼' },
    { id: 'police', icon: '👮' },
    { id: 'ems', icon: '🚑' },
] as const;

export function Channels() {
    const { activeChannel, setActiveChannel, messages } = useChatStore();
    const { t } = useTranslation();

    // Check if inactive tabs have new messages
    const hasNewMessages = (channelId: string): boolean => {
        if (channelId === activeChannel) return false;
        if (channelId === 'all') return false;

        // Get the last message timestamp for this channel when it was active
        const recent = messages
            .filter((m) => m.channel === channelId)
            .slice(-1)[0];

        return !!recent;
    };

    return (
        <div className="flex gap-2 px-4 py-2 border-b border-white/10 overflow-x-auto">
            {CHANNELS.map((channel) => (
                <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={classNames(
                        'flex items-center gap-1 px-3 py-1.5 text-sm font-medium transition-all relative',
                        'border-b-2 whitespace-nowrap',
                        activeChannel === channel.id
                            ? 'border-blue-500 text-white'
                            : 'border-transparent text-gray-400 hover:text-gray-200'
                    )}
                >
                    <span>{channel.icon}</span>
                    <span>{t(`ui.channels.${channel.id}`, channel.id)}</span>
                    {hasNewMessages(channel.id) && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                </button>
            ))}
        </div>
    );
}
