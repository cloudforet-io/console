import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export type UserReferenceItem = Required<Pick<ReferenceItem<undefined>, 'key'|'label'|'name'>>;

export type UserReferenceMap = ReferenceMap<UserReferenceItem>;

export interface UserReferenceState {
    items?: UserReferenceMap;
}
