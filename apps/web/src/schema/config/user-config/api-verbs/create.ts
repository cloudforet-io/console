import type { Tags } from '@/api-clients/_common/schema/model';

export interface UserConfigCreateParameters<T = Record<string, any>> {
    name: string;
    data: T;
    tags?: Tags;
}
