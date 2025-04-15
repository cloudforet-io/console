import { range } from 'lodash';
import { describe, it, expect } from 'vitest';

import { getRefinedXYChartData } from '@/services/_shared/dashboard/dashboard-detail/legacy/widgets/_helpers/widget-chart-data-helper';

interface SubData {
    date: string;
    value: number;
}
const getMockSubData = (length = 10, year = 2023): SubData[] => {
    let month = 1;
    return range(length).map(() => {
        const refinedMonth = month < 10 ? `0${month}` : month;
        month += 1;
        const randomValue = window.crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff * 100;
        return { date: `${year}-${refinedMonth}`, value: randomValue };
    });
};
interface MockData {
    value_sum: { date: string; value: number }[];
    usage_sum: { date: string; value: number }[];
    provider: string;
}
const providerList = ['aws', 'azure', 'gcp'];
const getMockData = (parentLength = 3, arrayLength = 10): MockData[] => range(parentLength).map((i) => ({
    value_sum: getMockSubData(arrayLength),
    usage_sum: getMockSubData(arrayLength),
    provider: providerList[i],
}));

interface ChartData {
    date: string;
    value: number;
}

describe('[WidgetChartDataHelper] getRefinedXYChartData', () => {
    describe('when only arrayDataKey, categoryKey and valueKey are given', () => {
        // basic
        it('should return array data by arrayDataKey which is clustered by categoryKey', () => {
            const data: MockData[] = getMockData(3, 10);
            const result = getRefinedXYChartData<MockData, ChartData>(data, {
                arrayDataKey: 'value_sum',
                categoryKey: 'date',
                valueKey: 'value',
            });
            expect(result.length).toBe(10);
            expect(result.map((r) => r.date)).toEqual(data[0].value_sum.map((d) => d.date));
        });
        it('should return array data including all values of categoryKey from each array data', () => {
            const data = [
                { value_sum: getMockSubData(10, 2022) },
                { value_sum: getMockSubData(10, 2023) },
            ];
            const result = getRefinedXYChartData(data, {
                arrayDataKey: 'value_sum',
                categoryKey: 'date',
                valueKey: 'value',
            });
            expect(result.length).toBe(20);
            expect(result.map((r) => r.date)).toEqual([...data[0].value_sum.map((d) => d.date), ...data[1].value_sum.map((d) => d.date)]);
        });
        it('should return array that have unique value for categoryKey', () => {
            const data: MockData[] = getMockData(3, 10);
            const result = getRefinedXYChartData(data, {
                arrayDataKey: 'value_sum',
                categoryKey: 'date',
                valueKey: 'value',
            });
            const uniqueDates = [...new Set(result.map((r) => r.date))];
            expect(uniqueDates.length).toBe(result.length);
        });
        it('should not merge value(with valueKey) from each array data but just overwrite it if there is a duplicated categoryKey', () => {
            const data: MockData[] = getMockData(3, 10);
            const result = getRefinedXYChartData(data, {
                arrayDataKey: 'value_sum',
                categoryKey: 'date',
                valueKey: 'value',
            });
            expect(result[0].value).toBe(data[2].value_sum[0].value);
        });
        // sort
        it('should sort by categoryKey', () => {
            const costSum = getMockSubData(10);
            costSum.reverse();
            const data = [
                { value_sum: costSum },
            ];
            const result = getRefinedXYChartData(data, {
                arrayDataKey: 'value_sum',
                categoryKey: 'date',
                valueKey: 'value',
            });
            expect(result[0].date).toBe('2023-01');
            expect(result[9].date).toBe('2023-10');
        });
        // arrayDataKey as array
        it('should return array data by all arrayDataKeys(array) which is clustered by categoryKey', () => {
            const data: MockData[] = getMockData(1, 10);
            const result = getRefinedXYChartData(data, {
                arrayDataKey: ['value_sum', 'usage_sum'],
                categoryKey: 'date',
                valueKey: 'value',
            });
            expect(result.length).toBe(10);
            expect(result.map((r) => r.date)).toEqual(data[0].value_sum.map((d) => d.date));
            expect(result.map((r) => r.value)).toEqual(data[0].usage_sum.sort((a, b) => a.date.localeCompare(b.date)).map((d) => d.value));
        });
    });

    describe('when additionalIncludeKeys are given', () => {
        it('should return array data including additionalIncludeKeys', () => {

        });
    });
});
