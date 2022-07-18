import type { Getter } from 'vuex';

import type { RegionReferenceItem, RegionReferenceState, SortedRegionReferenceItem } from '@/store/modules/reference/region/type';


export const regionsSortedByProvider: Getter<RegionReferenceState, any> = (state): SortedRegionReferenceItem[] => {
    const regions = Object.keys(state.items);
    return regions.map(k => ({
        ...state.items[k] as RegionReferenceItem,
        id: k,
    })).sort((a, b) => {
        if (a.data.provider < b.data.provider) return -1;
        if (a.data.provider > b.data.provider) return 1;
        return 0;
    });
};
