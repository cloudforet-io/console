export const TOAST_GROUP = {
    toastTopCenter: 'toastTopCenter',
    toastTopLeft: 'toastTopLeft',
    toastTopRight: 'toastTopRight',
    toastBottomLeft: 'toastBottomLeft',
    toastBottomRight: 'toastBottomRight',
} as const;

export type ToastGroup = typeof TOAST_GROUP[keyof typeof TOAST_GROUP];
export type ToastPosition = 'top center' | 'top left' | 'top right' | 'bottom left' | 'bottom right';

export const TOAST_GROUP_POSITION_MAP: Record<ToastGroup, ToastPosition> = {
    [TOAST_GROUP.toastTopCenter]: 'top center',
    [TOAST_GROUP.toastTopLeft]: 'top left',
    [TOAST_GROUP.toastTopRight]: 'top right',
    [TOAST_GROUP.toastBottomLeft]: 'bottom left',
    [TOAST_GROUP.toastBottomRight]: 'bottom right',
};
