import type { Tags } from '@/api-clients/_common/schema/model';
import type { Capability, RegistryType } from '@/api-clients/repository/plugin/schema/type';

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
