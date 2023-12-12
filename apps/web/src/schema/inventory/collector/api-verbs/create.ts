import type { Tags } from '@/schema/_common/model';
import type { CollectorPluginModel } from '@/schema/inventory/collector/model';
import type { Schedule, SecretFilter } from '@/schema/inventory/collector/type';

export interface CollectorCreateParameters {
    plugin_info?: Partial<CollectorPluginModel>;
    provider?: string;
    name?: string;
    schedule?: Schedule; // backend api will replace whole schedule object
    secret_filter?: SecretFilter; // backend api will replace whole schedule object
    tags?: Tags;
}
