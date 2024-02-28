import type { TranslateResult } from 'vue-i18n';

import type { ContextMenuType, MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { RECENT_TYPE } from '@/common/modules/navigations/stores/recent-store';

export const SUGGESTION_TYPE = Object.freeze({
    DEFAULT_SERVICE: 'DEFAULT_SERVICE',
    ...RECENT_TYPE,
} as const);
export type SuggestionType = typeof SUGGESTION_TYPE[keyof typeof SUGGESTION_TYPE];

export interface SuggestionItem extends MenuItem {
    itemType?: SuggestionType;
    parents?: SuggestionItem[];
    icon?: string;
    defaultIcon?: string;
    provider?: string;
    type?: ContextMenuType;
    name?: string;
    label?: string|TranslateResult;
}
