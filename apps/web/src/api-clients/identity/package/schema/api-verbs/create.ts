import type { Tags } from '@/api-clients/_common/schema/model';

export interface PackageCreateParameters {
    name: string;
    description?: string;
    tags?: Tags;
}
