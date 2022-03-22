import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

export const focusStartPositions = ['START', 'END'] as const;
export type FocusStartPosition = typeof focusStartPositions[number];

export type SuggestionType = 'MENU'|'CLOUD_SERVICE'

export interface SuggestionItem extends MenuItem {
    parents?: SuggestionItem[];
    icon?: string;
    defaultIcon?: string;
}
