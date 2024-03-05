import type { TranslateResult } from 'vue-i18n';

import type { ContextMenuType, MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

export const SUGGESTION_TYPE = {
    DEFAULT_SERVICE: 'DEFAULT_SERVICE',
    RECENT: 'RECENT',
} as const;
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

export const SEARCH_TAB = {
    SERVICE: 'service',
    SERVICE_ACCOUNT: 'serviceAccount',
    PROJECT: 'project',
    DASHBOARD: 'dashboard',
    CLOUD_SERVICE: 'cloudService',
} as const;
