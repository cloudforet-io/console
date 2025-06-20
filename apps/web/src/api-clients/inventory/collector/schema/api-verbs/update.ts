import type { Tags } from '@/api-clients/_common/schema/model';
import type { Schedule, SecretFilter } from '@/api-clients/inventory/collector/schema/type';

// collector api parameters
export interface CollectorUpdateParameters {
    collector_id: string;
    name?: string;
    schedule?: Schedule; // backend api will replace whole schedule object
    secret_filter?: SecretFilter; // backend api will replace whole schedule object
    tags?: Tags;
}
