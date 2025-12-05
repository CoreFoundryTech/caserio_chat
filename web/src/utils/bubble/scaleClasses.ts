export type Scale = 'small' | 'medium' | 'large';

export const scaleClasses: Record<Scale, string> = {
    small: 'text-sm scale-90 origin-left',
    medium: 'text-base scale-100 origin-left',
    large: 'text-lg scale-110 origin-left',
};
