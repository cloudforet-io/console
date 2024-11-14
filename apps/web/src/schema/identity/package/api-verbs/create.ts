import type { Tags } from '@/schema/_common/model';

export interface PackageCreateParameters {
    name: string;
    description: string;
    tags: Tags;
}
