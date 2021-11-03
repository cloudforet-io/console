import { COLLAPSIBLE_LIST_THEME, COLLAPSIBLE_LIST_TOGGLE_POSITION } from '@/data-display/collapsibles/collapsible-list/config';
import { COLLAPSIBLE_TOGGLE_TYPE } from '@/data-display/collapsibles/collapsible-toggle/type';

export interface CollapsibleItem {
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
