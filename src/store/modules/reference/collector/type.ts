import { ReferenceItem, ReferenceMap, ReferenceState } from '@/store/modules/reference/type';

export type CollectorReferenceItem = Required<Pick<ReferenceItem<undefined>, 'label'|'name'|'icon'>>

export type CollectorReferenceMap = ReferenceMap<CollectorReferenceItem>

export type CollectorReferenceState = ReferenceState<CollectorReferenceMap>
