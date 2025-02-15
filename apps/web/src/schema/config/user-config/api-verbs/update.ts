import type { Tags } from '@/api-clients/_common/schema/model';

export interface UserConfigUpdateParameters<T = Record<string, any>> {
    name: string;
    data?: T;
    tags?: Tags;
}
