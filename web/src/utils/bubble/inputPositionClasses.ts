import type { Position } from './positionClasses';

export const inputPositionClasses: Record<Position, string> = {
    'top-left': 'top-24 left-10', // Justo debajo del header del chat si hubiera
    'top-center': 'top-24 left-1/2 -translate-x-1/2',
    'top-right': 'top-24 right-10',

    'center-left': 'top-1/2 left-10 -translate-y-1/2',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'center-right': 'top-1/2 right-10 -translate-y-1/2',

    'bottom-left': 'bottom-10 left-10',
    'bottom-center': 'bottom-10 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-10 right-10',
};
