import type { JsonSchema } from '@cloudforet/mirinae/types/controls/forms/json-schema-form/type';

import type { Tags } from '@/api-clients/_common/schema/model';
import type { SchemaType } from '@/api-clients/identity/schema/schema/type';

export interface SchemaCreateParameters {
    schema_id: string;
    name: string;
    schema_type: SchemaType;
    schema: JsonSchema;
    provider: string;
    related_schemas?: string[];
    options?: Record<string, any>;
    tags: Tags;
}
