import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import type { IDateAxisSettings } from '@amcharts/amcharts5/xy';
import dayjs from 'dayjs';

import { COST_DATA_FIELD_MAP, GRANULARITY } from '@/api-clients/dashboard/_constants/widget-constant';
import type { DateRange } from '@/api-clients/dashboard/_types/dashboard-type';
import type { Granularity } from '@/api-clients/dashboard/_types/widget-type';

import type {
    Legend,
} from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_types/widget-type';
import type { AllReferenceTypeInfo } from '@/services/dashboards/stores/all-reference-type-info-store';


interface RawData {
    [key: string]: any;
}

/**
 * @name getXYChartLegends
 * @description Extract legends from raw data.
 */
export const getXYChartLegends = <T = Record<string, any>>(
    rawData?: T[],
    dataField?: string,
    allReferenceTypeInfo?: AllReferenceTypeInfo,
    disableReferenceColor = false,
): Legend[] => {
    if (!rawData || !dataField) return [];
    const legends: Legend[] = [];
    rawData.forEach((d) => {
        let _name = d[dataField];
        let _label = d[dataField];
        let _color;
        const referenceTypeInfo = Object.values(allReferenceTypeInfo ?? {}).find((info) => info.key === dataField);
        if (_name && referenceTypeInfo) {
            const referenceMap = referenceTypeInfo.referenceMap;
            _label = referenceMap[_name]?.label ?? referenceMap[_name]?.name ?? _name;
            if (dataField === COST_DATA_FIELD_MAP.PROVIDER.name && !disableReferenceColor) {
                _color = referenceMap[_name]?.color;
            }
        } else if (!_name) {
            _name = `no_${dataField}`;
            _label = 'Unknown';
        }
        legends.push({
            name: _name,
            label: _label,
            color: _color,
            disabled: false,
        });
    });
    return legends;
};

export const getPieChartLegends = (rawData: RawData[], dataField?: string): Legend[] => {
    if (!rawData || !dataField) return [];
    return rawData.map((d) => ({ name: d[dataField], disabled: false }));
};

export const getDateAxisSettings = (dateRange: DateRange, granularity?: Granularity): Partial<IDateAxisSettings<any>> => {
    let timeUnit: TimeUnit = 'month';
    if (granularity === GRANULARITY.YEARLY) timeUnit = 'year';
    if (granularity === GRANULARITY.DAILY) timeUnit = 'day';
    const start = dayjs.utc(dateRange.start);
    const end = dayjs.utc(dateRange.end).add(1, timeUnit); // 1 month added because of `max` property bug
    return {
        min: start.valueOf(),
        max: end.valueOf(),
    };
};
