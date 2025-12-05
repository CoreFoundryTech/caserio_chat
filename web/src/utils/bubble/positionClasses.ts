export type Position =
    | 'top-left' | 'top-center' | 'top-right'
    | 'center-left' | 'center' | 'center-right'
    | 'bottom-left' | 'bottom-center' | 'bottom-right';

export const positionClasses: Record<Position, string> = {
    'top-left': 'top-10 left-10 items-start',
    'top-center': 'top-10 left-1/2 -translate-x-1/2 items-center',
    'top-right': 'top-10 right-10 items-end',
    'center-left': 'top-1/2 -translate-y-1/2 left-10 items-start',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center',
    'center-right': 'top-1/2 -translate-y-1/2 right-10 items-end',
    'bottom-left': 'bottom-32 left-10 items-start flex-col-reverse', // Messages stack upwards
    'bottom-center': 'bottom-32 left-1/2 -translate-x-1/2 items-center flex-col-reverse', // Messages stack upwards
    'bottom-right': 'bottom-32 right-10 items-end flex-col-reverse', // Messages stack upwards
};
