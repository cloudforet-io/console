import type { Tags } from '@/schema/_common/model';

export interface SchemaUpdateParameters {
    schema_id: string,
    name?: string,
    schema?: any,
    related_schemas?: string[],
    options?: any,
    tags?: Tags,
}
