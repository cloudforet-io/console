import type { Tags } from '@/api-clients/_common/schema/model';

export interface PackageUpdateParameters {
    package_id: string;
    name?: string;
    description?: string;
    tags?: Tags;
}
