export const ANIMATION_TYPE = {
    spin: 'spin',
    reserveSpin: 'reserve-spin',
} as const;

export type AnimationType = typeof ANIMATION_TYPE[keyof typeof ANIMATION_TYPE];
