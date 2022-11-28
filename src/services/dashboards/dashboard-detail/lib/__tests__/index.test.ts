import { describe, expect } from 'vitest';

import {
    WIDGET_FRAME_CONTAINER_MAX_WIDTH,
    WIDGET_FRAME_CONTAINER_MIN_WIDTH,
} from '@/services/dashboards/dashboard-detail/lib/config';
import { widgetFrameWidthAssigner } from '@/services/dashboards/dashboard-detail/lib/helper';


/**
 * For manual test
 * */
const _MANUAL_CONTAINER_WIDTH = 1360;
const _MANUAL_WIDGET_FRAME_SELECT = ['MD', 'MD', 'SM', 'MD', 'LG', 'SM'];
// WidgetFrame Array would be shift(), so length should be saved
const _MANUAL_WIDGET_FRAME_LENGTH = _MANUAL_WIDGET_FRAME_SELECT.length;

describe(`WidgetFrame test with ${_MANUAL_WIDGET_FRAME_SELECT} in ${_MANUAL_CONTAINER_WIDTH}`, () => {
    it('Count of widgetFrames should not be changed after assigning its width', () => {
        let outputWidgetFrameCount = 0;
        widgetFrameWidthAssigner(_MANUAL_WIDGET_FRAME_SELECT, _MANUAL_CONTAINER_WIDTH)
            .forEach((d) => { outputWidgetFrameCount += d.length; });
        expect(_MANUAL_WIDGET_FRAME_LENGTH).toEqual(outputWidgetFrameCount);
    });
});


/**
 * For automatic every tests
 * */

// Selecting all collections of widgetFrames
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
const _SELECT_WIDGET_AMOUNT = 2;
// e.g) [['SM', 'SM', 'MD'], ['SM', 'SM', 'LG'] ...]
const widgetFrameCases: Array<Array<string>> = permutation(['SM', 'MD', 'LG', 'XL', 'FULL'], _SELECT_WIDGET_AMOUNT);
const widgetFrameCasesLength = widgetFrameCases.length;

describe('Select widgetFrames as permutation', () => {
    it('Count of selected widgetFrames would be (5 ** _SELECT_WIDGET_AMOUNT)', () => {
        expect(widgetFrameCases.length).toBe(5 ** _SELECT_WIDGET_AMOUNT);
    });
});

describe('Assign width for permutation selected widgetFrames', () => {
    let assignedWidgetFrameCasesCount = 0;
    let rowWidgetFrameWidthSum = 0;

    it('Count of widgetFrames should not be changed after assigning its width', () => {
        for (let caseCount = 0; caseCount < widgetFrameCasesLength; caseCount += 1) {
            for (let containerWidth = WIDGET_FRAME_CONTAINER_MIN_WIDTH; containerWidth <= WIDGET_FRAME_CONTAINER_MAX_WIDTH; containerWidth += 80) {
                assignedWidgetFrameCasesCount = 0;
                const selectedCase = [...widgetFrameCases[caseCount]];

                // eslint-disable-next-line no-loop-func
                widgetFrameWidthAssigner(selectedCase, containerWidth).forEach((row) => {
                    assignedWidgetFrameCasesCount += row.length;
                    row.forEach((element) => {
                        rowWidgetFrameWidthSum += element;
                    });
                });

                // eslint-disable-next-line no-loop-func
                it(`Output in containerWidth = ${containerWidth} would be ${assignedWidgetFrameCasesCount}`, () => {
                    expect(assignedWidgetFrameCasesCount).toBe(widgetFrameCases[caseCount]);
                });

                // eslint-disable-next-line no-loop-func
                it('Each row sum of widgetFrames should not bigger than containerWidth', () => {
                    expect(rowWidgetFrameWidthSum).lessThanOrEqual(containerWidth);
                });
            }
        }
    });
});
