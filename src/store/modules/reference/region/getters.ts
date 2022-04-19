import { Getter } from 'vuex';
import { RegionReferenceItem, RegionReferenceState, SortedRegionReferenceItem } from '@/store/modules/reference/region/type';


export const regionsSortedByProvider: Getter<RegionReferenceState, any> = (state): SortedRegionReferenceItem[] => {
    const regions = Object.keys(state.items);
    return regions.map(k => ({
        ...regions[k] as RegionReferenceItem,
        id: k,
    })).sort((a, b) => {
        if (a.data.provider < b.data.provider) return -1;
        if (a.data.provider > b.data.provider) return 1;
        return 0;
    });
};
