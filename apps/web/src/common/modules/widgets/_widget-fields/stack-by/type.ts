import type { FieldDataTargetType } from '@/common/modules/widgets/types/widget-field-type';


export interface StackByOptions {
    dataTarget: FieldDataTargetType;
    max: number;
    defaultMaxCount: number;
    excludeDateField?: boolean;
}

export interface StackByValue {
    data?: string;
    count: number;
}
