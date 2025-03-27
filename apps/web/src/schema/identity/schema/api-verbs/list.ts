import type { Query } from '@cloudforet/core-lib/space-connector/type';

import type { SchemaType } from '@/schema/identity/schema/type';

export interface SchemaListParameters {
    query?: Query;
    schema_id?: string;
    name?: string;
    schema_type?: SchemaType;
    provider?: string;
    related_schema_id?: string;
    is_managed?: boolean;
}
