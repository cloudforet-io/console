import type { Getter } from 'vuex';

import type { RegionReferenceState, SortedRegionReferenceItem } from '@/store/modules/reference/region/type';

export const regionsSortedByProvider: Getter<RegionReferenceState, any> = (state): SortedRegionReferenceItem[] => {
    if (!state.items) return [];
    const regionItems = Object.values(state.items) as SortedRegionReferenceItem[];
    return regionItems.sort((a, b) => {
        if (a.data.provider < b.data.provider) return -1;
        if (a.data.provider > b.data.provider) return 1;
        return 0;
    });
};
