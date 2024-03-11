import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export type ServiceAccountReferenceItem = Required<Pick<ReferenceItem<{
    account_id?: string;
    subscription_id?: string;
    project_id?: string;
}>, 'key'|'label'|'name'|'provider'|'data'>>;

export type ServiceAccountReferenceMap = ReferenceMap<ServiceAccountReferenceItem>;

export interface ServiceAccountReferenceState {
    items?: ServiceAccountReferenceMap;
}
