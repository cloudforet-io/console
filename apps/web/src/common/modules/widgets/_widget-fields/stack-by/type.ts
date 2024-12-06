import type { FieldDataTargetType } from '@/common/modules/widgets/types/widget-field-type';

export interface StackByValue {
    value: string;
    count: number;
}

export interface StackByOptions {
    dataTarget: FieldDataTargetType;
    max: number;
    defaultMaxCount: number;
    excludeDateField?: boolean;
}

export interface _StackByValue {
    data?: string;
    count: number;
}
