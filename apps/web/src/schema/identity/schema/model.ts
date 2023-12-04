import type { Tags, TimeStamp } from '@/schema/_common/model';
import type { SchemaType } from '@/schema/identity/schema/type';

export interface SchemaModel {
    schema_id: string,
    name:string,
    schema_type: SchemaType,
    schema: any,
    provider: string,
    related_schemas: string[],
    options: any,
    tags: Tags,
    is_managed: boolean,
    created_at: TimeStamp,
    updated_at: TimeStamp
}
