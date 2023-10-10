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
export type SizeUnitMap = keyof typeof SIZE_UNIT_MAP;

export const EXTRA_UNIT_MAP = {
    Count: 'Count',
} as const;
export type ExtraUnitMap = keyof typeof EXTRA_UNIT_MAP;

interface UsageUnitFormatterOptions {
    unit?: SizeUnitMap | ExtraUnitMap | string | null;
    outputSizeUnit?: typeof SIZE_UNIT_MAP[SizeUnitMap];
}

const isSizeUnit = (unit: string): boolean => unit in SIZE_UNIT_MAP;

export const usageUnitFormatter = (value: number, options?: UsageUnitFormatterOptions): string => {
    const { unit, outputSizeUnit } = options || {};
    if (unit && isSizeUnit(unit)) {
        const parsedValue = bytes.parse(`${value}${SIZE_UNIT_MAP[unit]}`); // 1kb -> 1024
        return byteFormatter(parsedValue, { unit: outputSizeUnit });
    }
    return numberFormatter(value);
};
