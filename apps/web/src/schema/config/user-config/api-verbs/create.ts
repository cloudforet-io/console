import type { Tags } from '@/schema/_common/model';

export interface UserConfigCreateParameters<T = Record<string, any>> {
    name: string;
    data: T;
    tags?: Tags;
}
