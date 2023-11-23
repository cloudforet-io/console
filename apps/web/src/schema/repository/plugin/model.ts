import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { Tags } from '@/schema/_common/model';

import type { MonitoringType } from '@/common/modules/monitoring/config';

export interface Capability {
    supported_schemas: string[];
    use_resource_secret: boolean;
    monitoring_type: MonitoringType;
    supported_providers?: string[];

    [key: string]: any;
}

export interface RepositoryInfo {
    created_at: string;
    endpoint: string;
    name: string;
    repository_id: string;
    repository_type: string;
}

export interface PluginModel {
    plugin_id: string;
    name: string;
    image: string;
    registry_type: 'DOCKER_HUB' | 'AWS_PUBLIC_ECR' | 'HARBOR';
    registry_url: string;
    registry_config: object;
    service_type: string;
    provider?: string;
    capability: Capability;
    template: {
        options: {
            schema: JsonSchema;
        }
    };
    repository_info: RepositoryInfo;
    project_id: string;
    labels: string[];
    version: string;
    tags: {
        icon?: string;
        description?: string;
        link?: string;
        beta?: string;
    } & Tags;
}
