import { describe, expect, it } from 'vitest';

import type { WidgetSize } from '@/api-clients/dashboard/_types/widget-type';

import {
    WIDGET_CONTAINER_MAX_WIDTH,
    WIDGET_CONTAINER_MIN_WIDTH,
} from '@/services/_shared/dashboard/dashboard-detail/constants/widget-container-config';
import { widgetWidthAssigner } from '@/services/_shared/dashboard/dashboard-detail/helpers/widget-width-helper';


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
 * For automatic every tests - with reduced test cases to avoid memory issues
 * */

// Generate a sample of widget combinations instead of all permutations
function generateWidgetSamples(widgetSizes: WidgetSize[], count: number, length: number): Array<Array<WidgetSize>> {
    const samples: Array<Array<WidgetSize>> = [];

    // Add some predefined combinations
    samples.push(Array(length).fill('sm'));
    samples.push(Array(length).fill('md'));
    samples.push(Array(length).fill('lg'));
    samples.push(Array(length).fill('xl'));
    samples.push(Array(length).fill('full'));

    // Add some mixed combinations
    samples.push(['sm', 'md', 'lg']);
    samples.push(['md', 'lg', 'xl']);
    samples.push(['sm', 'lg', 'full']);
    samples.push(['sm', 'md', 'xl']);
    samples.push(['md', 'xl', 'full']);

    // Add some random combinations
    for (let i = samples.length; i < count; i++) {
        const sample: WidgetSize[] = [];
        for (let j = 0; j < length; j++) {
            const randomIndex = Math.floor(Math.random() * widgetSizes.length);
            sample.push(widgetSizes[randomIndex]);
        }
        samples.push(sample);
    }

    return samples;
}

// Reduced widget amount to avoid memory issues
const _SELECT_WIDGET_AMOUNT = 3;
// Generate a smaller sample of widget combinations
const widgetSizes: WidgetSize[] = ['sm', 'md', 'lg', 'xl', 'full'];
const widgetCases: Array<Array<WidgetSize>> = generateWidgetSamples(widgetSizes, 20, _SELECT_WIDGET_AMOUNT);

describe('Widget samples test', () => {
    it('Should generate the expected number of widget samples', () => {
        expect(widgetCases.length).toBe(20);
    });
});

describe('Assign width for widget samples', () => {
    describe('Widget assignment tests', () => {
        // Test a subset of container widths to reduce test time
        const containerWidths = [WIDGET_CONTAINER_MIN_WIDTH, 1000, WIDGET_CONTAINER_MAX_WIDTH];

        // Test each widget case with each container width
        widgetCases.forEach((widgetCase, caseIndex) => {
            containerWidths.forEach((containerWidth) => {
                it(`Case ${caseIndex} with containerWidth=${containerWidth}: Widget count should be preserved and row widths should be valid`, () => {
                    let assignedWidgetCount = 0;
                    const originalWidgetCount = widgetCase.length;
                    const selectedCase = [...widgetCase];

                    const result = widgetWidthAssigner(selectedCase, containerWidth);

                    // Check widget count is preserved
                    result.forEach((row) => {
                        assignedWidgetCount += row.length;

                        // Check each row's width sum is not greater than container width
                        const rowWidthSum = row.reduce((sum, width) => sum + width, 0);
                        expect(rowWidthSum).toBeLessThanOrEqual(containerWidth);
                    });

                    expect(assignedWidgetCount).toBe(originalWidgetCount);
                });
            });
        });
    });
});
