import type { FieldDataTargetType } from '@/common/modules/widgets/types/widget-field-type';


export interface XAxisOptions {
    dataTarget: FieldDataTargetType;
    max: number;
    defaultMaxCount: number;
    excludeDateField?: boolean;
}
export interface XAxisValue {
    data?: string;
    count: number;
}
