import type { UpgradeMode } from '@/schema/plugin/plugin/type';

export interface GetPluginEndpointParameters {
    plugin_id: string;
    version?: string;
    upgrade_mode?: UpgradeMode;
    labels?: object;
    domain_id: string;
}

export interface GetPluginEndpointResponse {
    endpoint: string;
    access_token: string;
    updated_version?: string;
}
