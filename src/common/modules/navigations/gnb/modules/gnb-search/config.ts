import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import { RECENT_TYPE } from '@/store/modules/recent/type';

export const focusStartPositions = ['START', 'END'] as const;
export type FocusStartPosition = typeof focusStartPositions[number];

export const SUGGESTION_TYPE = Object.freeze({
    ...FAVORITE_TYPE,
    ...RECENT_TYPE,
} as const);
export type SUGGESTION_TYPE = typeof SUGGESTION_TYPE[keyof typeof SUGGESTION_TYPE]

export interface SuggestionItem extends MenuItem {
    itemType?: SUGGESTION_TYPE;
    parents?: SuggestionItem[];
    icon?: string;
    defaultIcon?: string;
    provider?: string;
}
