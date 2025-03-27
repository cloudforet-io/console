import type { TagType } from '@/services/asset-inventory-v1/constants/cloud-service-detail-constant';

export interface CloudServiceTagTableItem {
    key: string;
    value: string;
    type: TagType;
    provider?: string;
}
