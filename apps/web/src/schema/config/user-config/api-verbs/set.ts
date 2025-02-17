import type { Tags } from '@/api-clients/_common/schema/model';

export interface UserConfigSetParameters<T = Record<string, any>> {
    name: string;
    data: T;
    tags?: Tags;
}
