import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import type { Tags } from '@/api-clients/_common/schema/model';

export interface SchemaUpdateParameters {
    schema_id: string;
    name?: string;
    schema?: JsonSchema;
    related_schemas?: string[];
    options?: Record<string, any>;
    tags?: Tags;
}
