import type { BoardItemProps } from '@/data-display/board-item/type';

export const BOARD_STYLE_TYPE = {
    list: 'list',
    cards: 'cards',
} as const;

export type BOARD_STYLE_TYPE = typeof BOARD_STYLE_TYPE[keyof typeof BOARD_STYLE_TYPE];

export interface StyleOptions {
    column?: number;
}

export interface BoardProps {
    styleType?: BOARD_STYLE_TYPE;
    styleOptions?: StyleOptions;
    boardSets: BoardItemProps[];
    pageLimit?: number;
    selectable?: boolean;
    selectedItem?: string;
}

export interface BoardSet extends BoardItemProps {
    [key: string]: any;
}
