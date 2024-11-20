export const TEXT_BUTTON_SIZE = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
} as const;

export type TextButtonSize = typeof TEXT_BUTTON_SIZE[keyof typeof TEXT_BUTTON_SIZE];

export const TEXT_BUTTON_STYLE = {
    default: 'default',
    highlight: 'highlight',
} as const;

export type TextButtonStyle = typeof TEXT_BUTTON_STYLE[keyof typeof TEXT_BUTTON_STYLE];

export interface TextButtonProps {
    styleType: TextButtonStyle;
    size: TextButtonSize;
    iconLeft?: string;
    iconRight?: string;
    loading?: boolean;
    disabled?: boolean;
    readonly?: boolean;
}
