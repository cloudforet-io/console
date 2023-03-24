import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export interface CloudServiceTypeResourceItemData {
    provider?: string;
    group?: string;
    cloudServiceTypeKey?: string;
}

export type CloudServiceTypeReferenceItem = Required<Pick<ReferenceItem<CloudServiceTypeResourceItemData>, 'key'|'label'|'name'|'icon'|'data'>>;

export type CloudServiceTypeReferenceMap = ReferenceMap<CloudServiceTypeReferenceItem>;

export interface CloudServiceTypeReferenceState {
    items?: CloudServiceTypeReferenceMap;
}
