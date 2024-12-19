import type { ResourceGroupType } from '@/schema/_common/type';

export interface PublicConfigCreateParameters<T = Record<string, any>> {
    name: string;
    data: T;
    resource_group: ResourceGroupType;
    tags?: Record<string, any>;
}
