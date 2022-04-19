import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';

export const focusStartPositions = ['START', 'END'] as const;
export type FocusStartPosition = typeof focusStartPositions[number];

export const SUGGESTION_TYPE = Object.freeze({
    MENU: 'MENU',
    CLOUD_SERVICE: 'CLOUD_SERVICE',
    PROJECT: 'PROJECT',
    PROJECT_GROUP: 'PROJECT_GROUP',
} as const);
export type SUGGESTION_TYPE = typeof SUGGESTION_TYPE[keyof typeof SUGGESTION_TYPE]

export interface SuggestionItem extends MenuItem {
    itemType?: SUGGESTION_TYPE;
    parents?: SuggestionItem[];
    icon?: string;
    defaultIcon?: string;
    provider?: string;
}
