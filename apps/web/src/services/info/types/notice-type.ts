import type { TranslateResult } from 'vue-i18n';

import type { SelectDropdownMenuItem } from '@spaceone/design-system/types/inputs/dropdown/select-dropdown/type';

export interface NoticePostBadgeInfo {
    label: TranslateResult;
    style: string;
}

export interface WorkspaceDropdownMenuItem extends SelectDropdownMenuItem {
    tags?: {
        theme?: string;
    };
}
