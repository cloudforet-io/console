import type { TimeUnit } from '@amcharts/amcharts5/.internal/core/util/Time';
import type { IDateAxisSettings } from '@amcharts/amcharts5/xy';
import dayjs from 'dayjs';

import { COST_DATA_FIELD_MAP, GRANULARITY } from '@/schema/dashboard/_constants/widget-constant';
import type { DateRange } from '@/schema/dashboard/_types/dashboard-type';
import type { Granularity } from '@/schema/dashboard/_types/widget-type';

import type { AllReferenceTypeInfo } from '@/store/reference/all-reference-store';

import type {
    Legend,
} from '@/services/dashboards/widgets/_types/widget-type';


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


type AppendedData<T> = T & {
    [dataField: string]: string | any;
};
/**
 * @name getRefinedPieChartData
 * @description Convert raw data to XYDateChart data.
 * @example(before) [{ provider: 'aws', cost_sum: 100  }, { provider: 'google_cloud', cost_sum: 100  }]
 * @example(after) [{ provider: 'AWS', cost_sum: 100  }, { provider: 'Google Cloud', cost_sum: 100  }]
 */
export const getRefinedPieChartData = <T extends RawData = RawData>(
    rawData: T[]|undefined,
    dataField: string|undefined,
    allReferenceTypeInfo: AllReferenceTypeInfo,
): AppendedData<T>[] => {
    if (!rawData || !dataField) return [];

    const chartData: AppendedData<T>[] = [];
    rawData.forEach((d) => {
        let _name = d[dataField];
        const referenceTypeInfo = Object.values(allReferenceTypeInfo).find((info) => info.key === dataField);
        if (_name && referenceTypeInfo) {
            const referenceMap = referenceTypeInfo.referenceMap;
            _name = referenceMap[_name]?.label ?? referenceMap[_name]?.name ?? _name;
        } else if (!_name) {
            _name = 'Unknown';
        }
        chartData.push({
            ...d,
            [dataField]: _name,
        } as AppendedData<T>);
    });
    return chartData;
};

