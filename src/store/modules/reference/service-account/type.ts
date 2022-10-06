import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export type ServiceAccountReferenceItem = Required<Pick<ReferenceItem<undefined>, 'key'|'label'|'name'>>;

export type ServiceAccountReferenceMap = ReferenceMap<ServiceAccountReferenceItem>;

export interface ServiceAccountReferenceState {
    items?: ServiceAccountReferenceMap;
}
