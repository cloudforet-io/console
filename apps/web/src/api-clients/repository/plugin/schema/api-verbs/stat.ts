import type { StatQuery } from '@/api-clients/_common/schema/type';

export interface PluginStatParameters {
    query: StatQuery;
    repository_id?: string;
}
