import type { BoardItemProps } from '@/data-display/board-item/type';

export const BOARD_STYLE_TYPE = {
    list: 'list',
    cards: 'cards',
} as const;

export type BOARD_STYLE_TYPE = typeof BOARD_STYLE_TYPE[keyof typeof BOARD_STYLE_TYPE];

export interface BoardProps {
    styleType?: BOARD_STYLE_TYPE;
    boardSets: BoardItemProps[];
    pageLimit?: number;
}

export interface BoardSet extends BoardItemProps {
    [key: string]: any;
}
