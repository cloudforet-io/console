export const WIDGET_SIZE = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    full: 'full',
} as const;
export type WidgetSize = typeof WIDGET_SIZE[keyof typeof WIDGET_SIZE];
