import { ReferenceItem, ReferenceMap, ReferenceState } from '@/store/modules/reference/type';

export type SecretReferenceItem = Required<Pick<ReferenceItem<undefined>, 'label'|'name'>>

export type SecretReferenceMap = ReferenceMap<SecretReferenceItem>

export type SecretReferenceState = ReferenceState<SecretReferenceMap>
