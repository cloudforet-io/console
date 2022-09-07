import type { ReferenceItem, ReferenceMap, ReferenceState } from '@/store/modules/reference/type';

export type ProviderReferenceItem = Required<Pick<ReferenceItem<undefined>, 'key'|'label'|'name'|'icon'|'color'|'linkTemplate'>>;

export type ProviderReferenceMap = ReferenceMap<ProviderReferenceItem>;

export type ProviderReferenceState = ReferenceState<ProviderReferenceMap>;
