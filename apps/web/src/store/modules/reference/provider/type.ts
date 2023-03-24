import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export type ProviderReferenceItem = Required<Pick<ReferenceItem<undefined>, 'key'|'label'|'name'|'icon'|'color'|'linkTemplate'>>;

export type ProviderReferenceMap = ReferenceMap<ProviderReferenceItem>;

export interface ProviderReferenceState {
    items?: ProviderReferenceMap;
}
