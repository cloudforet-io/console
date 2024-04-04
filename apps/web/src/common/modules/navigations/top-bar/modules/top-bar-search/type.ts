import type { SuggestionItem, SuggestionType } from '@/common/modules/navigations/top-bar/modules/top-bar-search/config';

export interface DropdownItem {
    itemType: SuggestionType;
    totalCount: number;
    suggestionItems: SuggestionItem[]|null;
}

export const focusingDirection = ['UPWARD', 'DOWNWARD'] as const;
export type FocusingDirection = typeof focusingDirection[number];

export interface StageWorkspace {
    workspaceId: string,
    label: string,
    theme?: string,
    isSelected: boolean
}

export const tabResourceTypeMap = {
    serviceAccount: 'identity.ServiceAccount',
    project: 'identity.Project',
    dashboard: 'dashboard.PublicDashboard',
    cloudService: 'inventory.CloudService',
};
export type SearchTab = keyof typeof tabResourceTypeMap | 'service';
