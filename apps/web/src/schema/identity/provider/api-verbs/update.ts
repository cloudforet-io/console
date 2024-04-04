import type { Tags } from '@/schema/_common/model';

export interface ProviderUpdateParameters {
    provider: string;
    name: string;
    alias?: string;
    color?: string;
    icon?: string;
    order?: number;
    options?: Record<string, any>;
    tags?: Tags;
}
