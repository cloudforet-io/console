import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import type { ResourceGroupType } from '@/api-clients/_common/schema/type';
import type { CostDataSourceSchedule, CostDataSourceSecretType, CostDataSourceType } from '@/api-clients/cost-analysis/data-source/schema/type';


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
    schedule: CostDataSourceSchedule;
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
    permissions: { deny: string[] };
    resource_group: Extract<ResourceGroupType, 'PROJECT'|'WORKSPACE'>
    workspace_id: string;
    domain_id: string;
    created_at: string;
    last_synchronized_at: string;
}
