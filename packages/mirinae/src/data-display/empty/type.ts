export const EmptyImageSize = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
} as const;
export type EmptyImageSize = typeof EmptyImageSize[keyof typeof EmptyImageSize];
