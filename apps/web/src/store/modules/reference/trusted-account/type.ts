import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export type TrustedAccountReferenceItem = Required<Pick<ReferenceItem<undefined>, 'key'|'label'|'name'>>;

export type TrustedAccountReferenceMap = ReferenceMap<TrustedAccountReferenceItem>;

export interface TrustedAccountReferenceState {
    items?: TrustedAccountReferenceMap;
}
