import type { TranslateResult } from 'vue-i18n';

import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { FAVORITE_TYPE } from '@/store/modules/favorite/type';
import { RECENT_TYPE } from '@/store/modules/recent/type';

export const SUGGESTION_TYPE = Object.freeze({
    ...FAVORITE_TYPE,
    ...RECENT_TYPE,
} as const);
export type SuggestionType = typeof SUGGESTION_TYPE[keyof typeof SUGGESTION_TYPE];

export interface SuggestionItem extends MenuItem {
    itemType?: SuggestionType;
    parents?: SuggestionItem[];
    icon?: string;
    defaultIcon?: string;
    provider?: string;
    type?: string;
    name?: string;
    label?: string|TranslateResult;
}
