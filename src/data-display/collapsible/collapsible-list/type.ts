import type { COLLAPSIBLE_LIST_THEME, COLLAPSIBLE_LIST_TOGGLE_POSITION } from '@/data-display/collapsible/collapsible-list/config';
import type { COLLAPSIBLE_TOGGLE_TYPE } from '@/data-display/collapsible/collapsible-toggle/type';

export interface CollapsibleItem {
    name?: string;
    title?: string;
    data: string;
}

export interface CollapsibleListProps {
    items: Array<CollapsibleItem|string>;
    unfoldedIndices?: number[];
    lineClamp?: number;
    multiUnfoldable?: boolean;
    togglePosition?: COLLAPSIBLE_LIST_TOGGLE_POSITION;
    toggleType?: COLLAPSIBLE_TOGGLE_TYPE;
    theme?: COLLAPSIBLE_LIST_THEME;
}
