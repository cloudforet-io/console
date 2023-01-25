import { sum, max } from 'lodash';

import {
    WIDGET_WIDTH_RANGE_LIST,
    WIDGET_GAP,
    WIDGET_WIDTH_CRITERIA,
} from '@/services/dashboards/dashboard-detail/lib/config';
import type { WidgetSize } from '@/services/dashboards/widgets/_configs/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';


const isEveryWidthMax = (sizeRow: string[], widthRow: number[]): boolean => sizeRow.every((size, idx) => {
    const maxWidth = max(WIDGET_WIDTH_RANGE_LIST[size]);
    return widthRow[idx] === maxWidth;
});

// make widgets bigger to fit in container
const getWidthRow = (sizeRow: string[], containerWidth: number): number[] => {
    const widthRow = sizeRow.map((d) => WIDGET_WIDTH_RANGE_LIST[d][0]);
    let extraWidth = containerWidth - ((widthRow.length - 1) * WIDGET_GAP) - sum(widthRow);
    if (extraWidth < WIDGET_WIDTH_CRITERIA) return widthRow;

    while (extraWidth >= WIDGET_WIDTH_CRITERIA && !isEveryWidthMax(sizeRow, widthRow)) {
        // eslint-disable-next-line no-loop-func
        sizeRow.forEach((size, idx) => {
            const maxWidth = max(WIDGET_WIDTH_RANGE_LIST[size]) as number;
            if (maxWidth > widthRow[idx] && extraWidth >= WIDGET_WIDTH_CRITERIA) widthRow[idx] += WIDGET_WIDTH_CRITERIA;
            extraWidth -= WIDGET_WIDTH_CRITERIA;
        });
    }
    return widthRow;
};

export const widgetWidthAssigner = (widgetSizeList: WidgetSize[], containerWidth: number): number[][] => {
    if (containerWidth < 800) return widgetSizeList.map(() => [containerWidth]);

    const results: number[][] = [];
    let sizeRow: string[] = [];
    widgetSizeList.forEach((widgetSize) => {
        if (widgetSize === WIDGET_SIZE.full) {
            results.push(getWidthRow(sizeRow, containerWidth));
            results.push([containerWidth]);
            sizeRow = [];
        } else {
            const pMinWidth = WIDGET_WIDTH_RANGE_LIST[widgetSize][0];
            const rowWidthSum = sum(sizeRow.map((d) => WIDGET_WIDTH_RANGE_LIST[d][0]));
            if (containerWidth - ((sizeRow.length - 1) * WIDGET_GAP) - rowWidthSum >= pMinWidth) {
                sizeRow.push(widgetSize);
            } else {
                results.push(getWidthRow(sizeRow, containerWidth));
                sizeRow = [widgetSize];
            }
        }
    });
    if (sizeRow.length) results.push(getWidthRow(sizeRow, containerWidth));
    return results;
};
