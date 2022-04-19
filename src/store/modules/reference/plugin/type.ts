import { ReferenceItem, ReferenceMap, ReferenceState } from '@/store/modules/reference/type';

export type PluginReferenceItem = Required<Pick<ReferenceItem<undefined>, 'label'|'name'|'icon'>>

export type PluginReferenceMap = ReferenceMap<PluginReferenceItem>

export type PluginReferenceState = ReferenceState<PluginReferenceMap>
