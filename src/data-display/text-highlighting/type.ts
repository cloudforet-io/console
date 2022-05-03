export const TEXT_HIGHLIGHTING_STYLE_TYPE = ['primary', 'secondary'] as const;
export type TextHighlightingStyleType = typeof TEXT_HIGHLIGHTING_STYLE_TYPE[number];

export interface TextHighlightingProps {
    text: string;
    term: string;
    styleType: TextHighlightingStyleType;
}
