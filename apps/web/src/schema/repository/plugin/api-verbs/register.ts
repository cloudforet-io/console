import type { Tags } from '@/schema/_common/model';
import type { Capability, RegistryType } from '@/schema/repository/plugin/type';

export interface PluginRegisterParameters {
    name: string;
    plugin_id?: string;
    resource_type: string;
    image: string;
    provider?: string;
    registry_type?: RegistryType;
    registry_config?: object;
    capability?: Capability;
    labels?: string[];
    tags?: {
        icon?: string;
        description?: string;
        link?: string;
        beta?: string;
    } & Tags;
}
