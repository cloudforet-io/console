import type { FieldDataTargetType } from '@/common/modules/widgets/types/widget-field-type';


export interface YAxisOptions {
    dataTarget: FieldDataTargetType;
    max: number;
    defaultMaxCount: number;
    excludeDateField?: boolean;
}
export interface YAxisValue {
    data?: string;
    count: number;
}
