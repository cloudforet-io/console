import type { Tags } from '@/api-clients/_common/schema/model';

export interface ProviderModel {
    provider: string;
    name: string;
    alias: string;
    color: string;
    icon: string;
    order: number;
    options: Record<string, any>;
    tags: Tags;
    plugin_info?: {
        plugin_id: string;
        version: string;
        upgrade_mode: 'AUTO'|'MANUAL'
        metadata: Record<string, any>
    }
    is_managed: boolean;
    domain_id: string;
    created_at: string;
    updated_at: string;
}
