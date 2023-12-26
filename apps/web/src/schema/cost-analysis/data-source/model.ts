import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { CostDataSourceSecretType, CostDataSourceState, CostDataSourceType } from '@/schema/cost-analysis/data-source/type';
import type { ResourceGroup } from '@/schema/identity/role-binding/type';


interface PluginInfoModel {
    plugin_id: string;
    version: string;
    options: Record<string, any>;
    metadata: Record<string, any>;
    secret_id: string;
    upgrade_mode: 'AUTO' | 'MANUAL';
}

interface SecretFilterModel {
    state: 'ENABLED' | 'DISABLED';
    secrets: string[];
    service_accounts: string[];
    schemas: string[];
}

interface TemplateModel {
    cost?: {
        schema: JsonSchema;
    };
}
export interface CostDataSourceModel {
    data_source_id: string;
    name: string;
    state: CostDataSourceState;
    data_source_type: CostDataSourceType;
    provider: string;
    secret_type: CostDataSourceSecretType;
    secret_filter: SecretFilterModel;
    plugin_info: PluginInfoModel;
    template: TemplateModel;
    tags: Record<string, any>;
    cost_tag_keys: string[];
    cost_additional_info_keys: string[];
    cost_data_keys: string[];
    resource_group: ResourceGroup;
    workspace_id: string;
    domain_id: string;
    created_at: string;
    last_synchronized_at: string;
}
