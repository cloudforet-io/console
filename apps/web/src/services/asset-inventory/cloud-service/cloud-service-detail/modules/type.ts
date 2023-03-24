import type { TagType } from '@/services/asset-inventory/cloud-service/cloud-service-detail/config';

export interface CloudServiceTagTableItem {
    key: string;
    value: string;
    type: TagType;
    provider?: string;
}
