import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export type ProtocolReferenceItem = Required<Pick<ReferenceItem<undefined>, 'key'|'label'|'name'>>;

export type ProtocolReferenceMap = ReferenceMap<ProtocolReferenceItem>;

export interface ProtocolReferenceState {
    items?: ProtocolReferenceMap;
}
