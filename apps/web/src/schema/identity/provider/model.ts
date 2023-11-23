import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { Tags, TimeStamp } from '@/schema/_common/model';

const idField = 'provider';

interface IdParameter {
    [idField]: string;
}

export interface ProviderModel extends Tags, IdParameter {
    name: string;
    template: {
        service_account: {
            schema: JsonSchema;
        };
    };
    capability: {
        supported_schema: string[];
    };
    created_at: TimeStamp;
}
