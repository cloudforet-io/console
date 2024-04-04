import type { Tags } from '@/schema/_common/model';
import type { Schedule, SecretFilter } from '@/schema/inventory/collector/type';

// collector api parameters
export interface CollectorUpdateParameters {
    collector_id: string;
    name?: string;
    schedule?: Schedule; // backend api will replace whole schedule object
    secret_filter?: SecretFilter; // backend api will replace whole schedule object
    tags?: Tags;
}
