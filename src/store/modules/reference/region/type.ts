import { ReferenceItem, ReferenceMap, ReferenceState } from '@/store/modules/reference/type';

export interface RegionResourceItemData {
    provider: string;
}

export type RegionReferenceItem = Required<Pick<ReferenceItem<RegionResourceItemData>, 'label'|'name'|'data'|'continent'>>

export type RegionReferenceMap = ReferenceMap<RegionReferenceItem>

export type RegionReferenceState = ReferenceState<RegionReferenceMap>

export interface SortedRegionReferenceItem extends RegionReferenceItem {
    id: string;
}
