import type { Tags } from '@/schema/_common/model';

export interface PackageUpdateParameters {
    package_id: string;
    name?: string;
    description?: string;
    tags?: Tags;
}
