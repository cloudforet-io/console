import type { SchemaModel } from '@/schema/identity/schema/model';


export interface GetSchemaParams {
    accountSchema: Partial<SchemaModel>|undefined;
    isTrustedAccount: boolean;
    userConfig: {
        userType: string;
        userId: string;
    }
}

export interface UpdateSchemaParams {
    resource_type: string;
    schema: string;
    options: {
        provider?: string;
        cloud_service_group?: string;
        cloud_service_type?: string;
    };
    data: any;
}
