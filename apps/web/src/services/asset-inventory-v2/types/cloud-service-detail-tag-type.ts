import type { TagType } from '@/services/asset-inventory/constants/cloud-service-detail-constant';

export interface CloudServiceTagTableItem {
    key: string;
    value: string;
    type: TagType;
    provider?: string;
}
