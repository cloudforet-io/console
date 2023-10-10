import bytes from 'bytes';

import { byteFormatter, numberFormatter } from '@cloudforet/core-lib';

export const SIZE_UNIT_MAP = {
    Bytes: 'B',
    KB: 'KB',
    MB: 'MB',
    GB: 'GB',
    PB: 'PB',
    TB: 'TB',
} as const;
export type SizeUnit = keyof typeof SIZE_UNIT_MAP;


interface BasicUsageUnitFormatterOptions {
    unit?: 'Count' | string | null;
}
interface SizeUsageUnitFormatterOptions {
    unit: SizeUnit;
    outputUnit?: typeof SIZE_UNIT_MAP[SizeUnit];
}

type UsageUnitFormatterOptions = BasicUsageUnitFormatterOptions | SizeUsageUnitFormatterOptions;

const isSizeUnit = (unit: string): boolean => unit in SIZE_UNIT_MAP;

export const usageUnitFormatter = (value: number, options?: UsageUnitFormatterOptions): string => {
    if (options?.unit && isSizeUnit(options.unit)) {
        const sizeOptions = options as SizeUsageUnitFormatterOptions;
        const parsedValue = bytes.parse(`${value}${SIZE_UNIT_MAP[sizeOptions.unit]}`); // 1KB -> 1024
        return byteFormatter(parsedValue, { unit: sizeOptions.outputUnit });
    }
    return numberFormatter(value);
};
