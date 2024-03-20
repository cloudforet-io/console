import type { ItemOptions } from '@spaceone/design-system/src/data-display/dynamic/dynamic-layout/type/layout-schema';
import type { QuerySearchTableOptions } from '@spaceone/design-system/types/data-display/dynamic/dynamic-layout/type/layout-schema';

import type { SchemaModel } from '@/schema/identity/schema/model';

export type ResourceType = 'identity.ServiceAccount'|'identity.TrustedAccount'|'inventory.CloudService'|'inventory.Server';

export interface GetSchemaParams {
    resourceType: ResourceType;
    accountSchema?: Partial<SchemaModel>|undefined;
    userData: {
        userType: string;
        userId: string;
    },
    options?: {
        include_optional_fields?: boolean;
        provider?: string;
        cloud_service_group?: string;
        cloud_service_type?: string;
        cloud_service_id?: string;
        server_id?: string;
        limit?: number;
        widget_type?: string;
        is_multiple?: boolean;
        include_workspace_info?: boolean;
    }
}

export interface UpdateSchemaParams {
    resourceType: ResourceType;
    schema: string;
    options: {
        provider?: string;
        cloud_service_group?: string;
        cloud_service_type?: string;
    };
    data: any;
}

export type ItemLayout = {
    name: string;
    type: string;
    options:ItemOptions
};

export type QuerySearchTableLayout = {
    name: string;
    type: string;
    options: QuerySearchTableOptions;
};
