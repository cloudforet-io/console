import type { Tags } from '@/schema/_common/model';

export interface UserConfigUpdateParameters<T = Record<string, any>> {
    name: string;
    data?: T;
    tags?: Tags;
}
