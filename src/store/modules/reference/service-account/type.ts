import type { ReferenceItem, ReferenceMap, ReferenceState } from '@/store/modules/reference/type';

export type ServiceAccountReferenceItem = Required<Pick<ReferenceItem<undefined>, 'label'|'name'>>;

export type ServiceAccountReferenceMap = ReferenceMap<ServiceAccountReferenceItem>;

export type ServiceAccountReferenceState = ReferenceState<ServiceAccountReferenceMap>;
