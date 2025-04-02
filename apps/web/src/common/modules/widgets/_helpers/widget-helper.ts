import bytes from 'bytes';

import { byteFormatter, customNumberFormatter, numberFormatter } from '@cloudforet/utils';

import { DATE_FIELD } from '@/common/modules/widgets/_constants/widget-constant';
import { NUMBER_FORMAT } from '@/common/modules/widgets/_constants/widget-field-constant';
import type { NumberFormatInfo } from '@/common/modules/widgets/_widget-fields/number-format/type';

import { SIZE_UNITS } from '@/services/asset-inventory/constants/asset-analysis-constant';


export const sortWidgetTableFields = (fields: string[]): string[] => {
    const priorityFields = Object.values(DATE_FIELD) as string[];
    const prioritySet = new Set(priorityFields);

    const priority = fields.filter((field) => prioritySet.has(field));
    const others = fields.filter((field) => !prioritySet.has(field));

    const sortedPriority = priorityFields.filter((field) => priority.includes(field));

    return [...sortedPriority, ...others];
};

/* Widget Number Format */
export const getFormattedNumber = (val: number, numberFormatInfo?: NumberFormatInfo, unit?: string): string => {
    if (!numberFormatInfo) return numberFormatter(val) || '--';
    const _targetNumberFormat = numberFormatInfo;
    switch (_targetNumberFormat?.format) {
    case NUMBER_FORMAT.AUTO:
        if (unit && SIZE_UNITS.includes(unit)) {
            const _originalVal = bytes.parse(`${val}${unit}`);
            return byteFormatter(_originalVal);
        }
        return numberFormatter(val, { notation: 'compact' }) || '--';
    // NOTE: temporary remove short number
    // case NUMBER_FORMAT.SHORT_NUMBER:
    //     return numberFormatter(val, { notation: 'compact' }) || '--';
    case NUMBER_FORMAT.FULL_NUMBER:
        return numberFormatter(val, { minimumFractionDigits: 2 }) || '--';
    case NUMBER_FORMAT.CUSTOM:
        if (!_targetNumberFormat.customNumberFormat) return val.toString();
        return customNumberFormatter(_targetNumberFormat.customNumberFormat, val) || '--';
    default:
        return val.toString();
    }
};

