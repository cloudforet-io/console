import type { ApiFilter } from '@cloudforet/core-lib/space-connector/type';

export interface AutocompleteDistinctParameters {
    resource_type: string;
    distinct_key: string;
    search?: string;
    options?: {
        limit?: number;
        search_type?: 'key' | 'value';
        filter?: ApiFilter[];
    };
    extra_params?: Record<string, any>;
}
