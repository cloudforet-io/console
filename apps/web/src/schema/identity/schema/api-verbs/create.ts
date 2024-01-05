import type { JsonSchema } from '@spaceone/design-system/types/inputs/forms/json-schema-form/type';

import type { Tags } from '@/schema/_common/model';
import type { SchemaType } from '@/schema/identity/schema/type';

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
