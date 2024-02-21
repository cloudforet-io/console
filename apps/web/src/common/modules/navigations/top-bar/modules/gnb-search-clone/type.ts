import type { SuggestionItem, SuggestionType } from '@/common/modules/navigations/top-bar/modules/gnb-search-clone/config';

export interface DropdownItem {
    itemType: SuggestionType;
    totalCount: number;
    suggestionItems: SuggestionItem[]|null;
}

export const focusingDirection = ['UPWARD', 'DOWNWARD'] as const;
export type FocusingDirection = typeof focusingDirection[number];
