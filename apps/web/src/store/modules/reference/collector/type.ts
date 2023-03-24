import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export type CollectorReferenceItem = Required<Pick<ReferenceItem<undefined>, 'key'|'label'|'name'|'icon'>>;

export type CollectorReferenceMap = ReferenceMap<CollectorReferenceItem>;

export interface CollectorReferenceState {
    items?: CollectorReferenceMap;
}
