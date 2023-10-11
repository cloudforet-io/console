import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

export interface PluginInfoModel {
    plugin_id: string;
    version: string;
    options: Record<string, any>;
    metadata: Record<string, any>;
    secret_id: string;
    upgrade_mode: 'AUTO' | 'MANUAL';
}

export interface SecretFilterModel {
    state: 'ENABLED' | 'DISABLED';
    secrets: string[];
    service_accounts: string[];
    schemas: string[];
}

export interface TemplateModel {
    cost?: {
        schema: JsonSchema;
    };
}
export interface DataSourceModel {
    data_source_id: string;
    name: string;
    state: 'ENABLED' | 'DISABLED';
    data_source_type: 'LOCAL' | 'MANAGED' | 'CUSTOM';
    provider: string;
    secret_type: 'MANUAL'| 'USE_SERVICE_ACCOUNT_SECRET';
    secret_filter: SecretFilterModel;
    plugin_info: PluginInfoModel;
    template: TemplateModel;
    tags: Record<string, any>;
    cost_tag_keys: string[];
    cost_additional_info_keys: string[];
    domain_id: string;
    created_at: string;
    last_synchronized_at: string;
}
