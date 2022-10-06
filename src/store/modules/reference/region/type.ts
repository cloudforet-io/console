import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export interface RegionResourceItemData {
    provider: string;
}

export type RegionReferenceItem = Required<Pick<ReferenceItem<RegionResourceItemData>, 'key'|'label'|'name'|'data'|'continent'|'longitude'|'latitude'>>;

export type RegionReferenceMap = ReferenceMap<RegionReferenceItem>;

export interface RegionReferenceState {
    items?: RegionReferenceMap;
}

export interface SortedRegionReferenceItem extends RegionReferenceItem {
    id: string;
}
