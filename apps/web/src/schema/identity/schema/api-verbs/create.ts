import type { Tags } from '@/schema/_common/model';
import type { SchemaType } from '@/schema/identity/schema/type';

export interface SchemaCreateParameters {
    schema_id: string,
    name: string,
    schema_type: SchemaType,
    schema: any,
    provider: string,
    related_schemas: string[],
    options: any,
    tags: Tags,
}
