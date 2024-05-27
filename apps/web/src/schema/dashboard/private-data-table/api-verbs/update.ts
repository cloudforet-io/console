import type { Tags } from '@/schema/_common/model';

export interface PublicDataTableCreateParameters {
    data_table_id: string;
    name?: string;
    options?: Record<string, any>;
    tags?: Tags;
}
