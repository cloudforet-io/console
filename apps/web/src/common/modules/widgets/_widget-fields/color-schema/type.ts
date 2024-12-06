import type { COLOR_SCHEMA } from '@/common/modules/widgets/_constants/widget-field-constant';

export type ColorValue = typeof COLOR_SCHEMA[keyof typeof COLOR_SCHEMA];
export interface ColorSchemaValue {
    colorName: keyof typeof COLOR_SCHEMA;
    colorValue: ColorValue;
}
export interface ColorSchemaOptions {
    default?: string;
}

export interface _ColorSchemaOptions {
    default?: keyof typeof COLOR_SCHEMA;
}
