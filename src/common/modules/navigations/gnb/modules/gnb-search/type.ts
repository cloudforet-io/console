import { SUGGESTION_TYPE, SuggestionItem } from '@/common/modules/navigations/gnb/modules/gnb-search/config';

export interface DropdownItem {
    itemType: SUGGESTION_TYPE;
    totalCount: number;
    suggestionItems: SuggestionItem[];
}

export const focusingDirection = ['UPWARD', 'DOWNWARD'] as const;
export type FocusingDirection = typeof focusingDirection[number];
