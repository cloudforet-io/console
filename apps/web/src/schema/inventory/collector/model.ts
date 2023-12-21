import type { Tags } from '@/schema/_common/model';
import type { ResourceGroup } from '@/schema/identity/role-binding/type';
import type {
    CollectorMetadata, CollectorOptions, Schedule, SecretFilter, UpgradeMode,
} from '@/schema/inventory/collector/type';
import type { Capability } from '@/schema/repository/plugin/type';


export interface CollectorPluginModel {
    plugin_id: string;
    version: string;
    options: CollectorOptions;
    metadata: CollectorMetadata;
    upgrade_mode: UpgradeMode;
    secret_filter?: {
        state: 'ENABLED'|'DISABLED';
        service_accounts?: string[];
        schemas?: string[];
        secrets?: string[];
    }
}


export interface CollectorModel {
    collector_id: string;
    name: string;
    provider: string;
    capability: Capability;
    schedule?: Schedule;
    secret_filter: SecretFilter;
    plugin_info: CollectorPluginModel;
    workspace_id: string;
    resource_group: ResourceGroup;
    created_at: string;
    last_collected_at: string;
    tags: Tags;
}

