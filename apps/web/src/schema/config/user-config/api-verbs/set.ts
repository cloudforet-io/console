import type { Tags } from '@/schema/_common/model';

export interface UserConfigSetParameters<T = Record<string, any>> {
    name: string;
    data: T;
    tags?: Tags;
}
