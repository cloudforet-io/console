import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { Tags } from '@/schema/_common/model';

export interface SchemaUpdateParameters {
    schema_id: string;
    name?: string;
    schema?: JsonSchema;
    related_schemas?: string[];
    options?: Record<string, any>;
    tags?: Tags;
}
