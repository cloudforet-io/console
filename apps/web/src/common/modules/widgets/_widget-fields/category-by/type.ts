import type { FieldDataTargetType } from '@/common/modules/widgets/types/widget-field-type';

export interface CategoryByValue {
    value: string;
    count: number;
}

export interface CategoryByOptions {
    dataTarget: FieldDataTargetType;
    max: number;
    defaultMaxCount: number;
    excludeDateField?: boolean;
}

export interface _CategoryByValue {
    data?: string;
    count: number;
}
