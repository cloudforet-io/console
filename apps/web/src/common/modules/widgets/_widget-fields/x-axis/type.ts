import type { FieldDataTargetType } from '@/common/modules/widgets/types/widget-field-type';

export interface XAxisValue {
    value: string;
    count: number;
}
export interface XAxisOptions {
    dataTarget: FieldDataTargetType;
    max: number;
    defaultMaxCount: number;
    excludeDateField?: boolean;
}
export interface _XAxisValue {
    data?: string;
    count: number;
}
