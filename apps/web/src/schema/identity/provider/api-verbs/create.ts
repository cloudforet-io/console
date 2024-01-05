import type { Tags } from '@/schema/_common/model';

export interface ProviderCreateParameters {
    provider: string;
    name: string;
    alias?: string;
    color?: string;
    icon?: string;
    order?: number;
    options?: Record<string, any>;
    tags?: Tags;
}
