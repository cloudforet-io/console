import { describe, expect } from 'vitest';

import {
    WIDGET_CONTAINER_MAX_WIDTH,
    WIDGET_CONTAINER_MIN_WIDTH, WIDGET_GAP,
} from '@/services/dashboards/dashboard-detail/lib/config';
import { widgetWidthAssigner } from '@/services/dashboards/dashboard-detail/lib/width-helper';
import type { WidgetSize } from '@/services/dashboards/widgets/_configs/config';


/**
 * For manual test
 * */
const _MANUAL_CONTAINER_WIDTH = 1360;
const MANUAL_WIDGET_SELECT: Array<WidgetSize> = ['md', 'md', 'sm', 'md', 'lg', 'sm'];
// Widget Array would be shift(), so length should be saved
const _MANUAL_WIDGET_LENGTH = MANUAL_WIDGET_SELECT.length;

describe(`Widget test with ${MANUAL_WIDGET_SELECT} in ${_MANUAL_CONTAINER_WIDTH}`, () => {
    it('Count of widget should not be changed after assigning its width', () => {
        let outputWidgetCount = 0;
        widgetWidthAssigner(MANUAL_WIDGET_SELECT, _MANUAL_CONTAINER_WIDTH)
            .forEach((d) => { outputWidgetCount += d.length; });
        expect(_MANUAL_WIDGET_LENGTH).toEqual(outputWidgetCount);
    });
});


/**
 * For automatic every tests
 * */

// Selecting all collections of widgets
function permutation(arr, selectNum) {
    const result: Array<string> = [];
    if (selectNum === 1) return arr.map((v) => [v]);

    arr.forEach((v, idx, arr2) => {
        const fixed = v;
        const restArr = arr2;
        const permutationArr = permutation(restArr, selectNum - 1);
        const combineFix: Array<string> = permutationArr.map((v2) => [fixed, ...v2]);
        result.push(...combineFix);
    });
    return result;
}

// if AMOUNT is more than 10, call stack boom
// for more specific test, please scale up the AMOUNT.
const _SELECT_WIDGET_AMOUNT = 4;
// e.g) [['sm', 'sm', 'md'], ['sm', 'sm', 'lg'] ...]
const widgetCases: Array<Array<WidgetSize>> = permutation(['sm', 'md', 'lg', 'xl', 'full'], _SELECT_WIDGET_AMOUNT);
const widgetCasesLength = widgetCases.length;

describe('Select widgets as permutation', () => {
    it('Count of selected widgets would be (5 ** _SELECT_WIDGET_AMOUNT)', () => {
        expect(widgetCases.length).toBe(5 ** _SELECT_WIDGET_AMOUNT);
    });
});

describe('Assign width for permutation selected widgets', () => {
    let assignedWidgetCasesCount = 0;
    let rowWidgetWidthSum = 0;

    it('Count of widgets should not be changed after assigning its width', () => {
        for (let caseCount = 0; caseCount < widgetCasesLength; caseCount += 1) {
            for (let containerWidth = WIDGET_CONTAINER_MIN_WIDTH; containerWidth <= WIDGET_CONTAINER_MAX_WIDTH; containerWidth += WIDGET_GAP) {
                assignedWidgetCasesCount = 0;
                const selectedCase = [...widgetCases[caseCount]];

                // eslint-disable-next-line no-loop-func
                widgetWidthAssigner(selectedCase, containerWidth).forEach((row) => {
                    assignedWidgetCasesCount += row.length;
                    row.forEach((element) => {
                        rowWidgetWidthSum += element;
                    });
                });

                // eslint-disable-next-line no-loop-func
                it(`Output in containerWidth = ${containerWidth} would be ${assignedWidgetCasesCount}`, () => {
                    expect(assignedWidgetCasesCount).toBe(widgetCases[caseCount]);
                });

                // eslint-disable-next-line no-loop-func
                it('Each row sum of widgets should not bigger than containerWidth', () => {
                    expect(rowWidgetWidthSum).lessThanOrEqual(containerWidth);
                });
            }
        }
    });
});
