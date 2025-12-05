import type { Message } from '../../stores/useChatStore';

export function getMessageBorderColor(message: Message, primaryColor: string): string {
    // Roleplay Commands
    if (message.message.startsWith('*') || message.message.includes('ME:')) return '#FFFFFF'; // /me (Standard White)
    if (message.message.startsWith('**') || message.message.includes('DO:')) return '#EF4444'; // /do (Red)

    // Channels
    if (message.channel === 'police') return '#3B82F6'; // Blue
    if (message.channel === 'ems') return '#10B981';    // Emerald
    if (message.channel === 'ooc') return '#6B7280';    // Gray
    if (message.channel === 'radio') return '#F59E0B';  // Amber
    if (message.channel === 'job') return '#8B5CF6';    // Violet

    // Admin/Important tags
    if (message.tags?.includes('ADMIN')) return '#DC2626'; // Red
    if (message.tags?.includes('IMPORTANT')) return '#DC2626'; // Red

    // Default System Color
    return primaryColor;
}
