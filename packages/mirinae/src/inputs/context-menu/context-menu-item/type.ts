import type { RouteLocation } from 'vue-router';

import type { SELECT_MARKERS } from '@/inputs/context-menu/context-menu-item/config';

export type SelectMarker = typeof SELECT_MARKERS[number];
export interface ContextMenuItemProps {
    name?: string | number;
    label?: number | string;
    link?: string;
    to?: RouteLocation;
    disabled?: boolean;
    selected?: boolean;
    selectMarker?: SelectMarker;
    ellipsis?: boolean;
    highlightTerm?: string;
    readonly?: boolean;
    icon?: string;
    imageUrl?: string;
}
