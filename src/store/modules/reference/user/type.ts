import { ReferenceItem, ReferenceMap, ReferenceState } from '@/store/modules/reference/type';

export type UserReferenceItem = Required<Pick<ReferenceItem<undefined>, 'label'|'name'>>

export type UserReferenceMap = ReferenceMap<UserReferenceItem>

export type UserReferenceState = ReferenceState<UserReferenceMap>
