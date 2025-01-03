import type { FieldDataTargetType } from '@/common/modules/widgets/types/widget-field-type';


export interface CategoryByOptions {
    dataTarget: FieldDataTargetType;
    max: number;
    defaultMaxCount: number;
    excludeDateField?: boolean;
}

export interface CategoryByValue {
    data?: string;
    count: number;
}
