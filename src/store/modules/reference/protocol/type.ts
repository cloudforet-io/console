import type { ReferenceItem, ReferenceMap, ReferenceState } from '@/store/modules/reference/type';

export type ProtocolReferenceItem = Required<Pick<ReferenceItem<undefined>, 'label'|'name'>>

export type ProtocolReferenceMap = ReferenceMap<ProtocolReferenceItem>

export type ProtocolReferenceState = ReferenceState<ProtocolReferenceMap>
