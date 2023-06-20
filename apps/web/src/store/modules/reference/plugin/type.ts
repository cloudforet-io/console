import type { ReferenceItem, ReferenceMap } from '@/store/modules/reference/type';

export type PluginReferenceItem = Required<Pick<ReferenceItem<undefined>, 'key'|'label'|'name'|'icon'|'description'|'link'>>;

export type PluginReferenceMap = ReferenceMap<PluginReferenceItem>;

export interface PluginReferenceState {
    items?: PluginReferenceMap;
}
