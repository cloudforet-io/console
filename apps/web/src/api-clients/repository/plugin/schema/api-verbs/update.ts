import type { Tags } from '@/api-clients/_common/schema/model';
import type { Capability } from '@/api-clients/repository/plugin/schema/type';

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
