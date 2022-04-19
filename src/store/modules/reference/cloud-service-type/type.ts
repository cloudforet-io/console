import { ReferenceItem, ReferenceMap, ReferenceState } from '@/store/modules/reference/type';

export interface CloudServiceTypeResourceItemData {
    provider?: string;
    group?: string;
}

export type CloudServiceTypeReferenceItem = Required<Pick<ReferenceItem<CloudServiceTypeResourceItemData>, 'label'|'name'|'icon'|'data'>>

export type CloudServiceTypeReferenceMap = ReferenceMap<CloudServiceTypeReferenceItem>

export type CloudServiceTypeReferenceState = ReferenceState<CloudServiceTypeReferenceMap>
