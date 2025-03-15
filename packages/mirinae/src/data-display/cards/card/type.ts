import type { CARD_SIZE, CARD_STYLE_TYPE } from '@/data-display/cards/card/config';

export interface CardProps {
    header?: string|boolean;
    styleType?: CARD_STYLE_TYPE;
    size?: CARD_SIZE;
}
