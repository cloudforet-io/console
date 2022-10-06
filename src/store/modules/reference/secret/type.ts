import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export type SecretReferenceItem = Required<Pick<ReferenceItem<undefined>, 'key'|'label'|'name'>>;

export type SecretReferenceMap = ReferenceMap<SecretReferenceItem>;

export interface SecretReferenceState {
    items?: SecretReferenceMap;
}
