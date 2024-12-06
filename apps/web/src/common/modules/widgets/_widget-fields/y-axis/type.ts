import type { FieldDataTargetType } from '@/common/modules/widgets/types/widget-field-type';

export interface YAxisValue {
    value: string;
    count: number;
}

export interface YAxisOptions {
    dataTarget: FieldDataTargetType;
    max: number;
    defaultMaxCount: number;
    excludeDateField?: boolean;
}
export interface _YAxisValue {
    data?: string;
    count: number;
}
