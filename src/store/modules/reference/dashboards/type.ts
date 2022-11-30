import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

// TODO::must be refactor
export type DashboardsReferenceItem = Required<Pick<ReferenceItem<undefined>, 'key'>>;

export type DashboardsReferenceMap = ReferenceMap<DashboardsReferenceItem>;

export interface DashboardsReferenceState {
    items?: DashboardsReferenceMap
}
