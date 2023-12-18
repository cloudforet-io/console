import type { Query } from '@cloudforet/core-lib/space-connector/type';

export interface ListUserConfigParameters {
    name?: string;
    query?: Query;
}
