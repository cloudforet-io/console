import type { Tags } from '@/schema/_common/model';
import type { Capability } from '@/schema/repository/plugin/type';

export interface PluginUpdateParameters {
    plugin_id: string;
    name?: string;
    capability?: Capability;
    labels: string[];
    tags?: {
        icon?: string;
        description?: string;
        link?: string;
        beta?: string;
    } & Tags;
}
