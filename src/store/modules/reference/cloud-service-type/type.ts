import { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export interface CloudServiceTypeResourceItemData {
    provider?: string;
    group?: string;
}

export type CloudServiceTypeResourceItem = ReferenceItem<CloudServiceTypeResourceItemData>

export type CloudServiceTypeResourceMap = ReferenceMap<CloudServiceTypeResourceItem>
