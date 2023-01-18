import {
    WIDGET_WIDTH_RANGE_LIST,
    WIDGET_WIDTH_RANGE_LENGTH_MAX,
    WIDGET_CONTAINER_MIN_WIDTH,
} from '@/services/dashboards/dashboard-detail/lib/config';
import type { WidgetSize } from '@/services/dashboards/widgets/_configs/config';
import { WIDGET_SIZE } from '@/services/dashboards/widgets/_configs/config';

/** NAMING
 * widgetSize: WidgetSize -> 'sm'|'md'|'lg'|'xl'
 * widgetWidth: number -> 320, 400... 880, 960
 * widgetWidthRange: Array<number> -> [320, 400, 480]|[480, 560, 640]|[800, 880, 960]|[800, 880, 960]
 * rowWidgetWidthRange: Array<Array<number>> -> [[MD_RANGE], [MD_RANGE], [SM_RANGE], [LG_RANGE]]
 * allWidgetWidthRange: Array<Array<Array<number>>> -> [[[MD_RANGE], [MD_RANGE]], [[SM_RANGE], [[LG_RANGE]]]
 * rowWidgetWidthList: Array<number> -> [320, 480]
 * allWidgetWidthList: Array<Array<number>> -> [[320], [320, 480], [320, 480]]
 * */


// each widget's gap are 16px
const GAP = 16;


const widgetSizeRangeExtractor = (size: WidgetSize, containerWidth: number = WIDGET_CONTAINER_MIN_WIDTH): Array<number> => {
    if (size === WIDGET_SIZE.sm) return WIDGET_WIDTH_RANGE_LIST.sm;
    if (size === WIDGET_SIZE.md) return WIDGET_WIDTH_RANGE_LIST.md;
    if (size === WIDGET_SIZE.lg) return WIDGET_WIDTH_RANGE_LIST.lg;
    if (size === WIDGET_SIZE.xl) return WIDGET_WIDTH_RANGE_LIST.xl;
    // WIDGET_WIDTH_RANGE_LIST length, it will return filled by ${containerWidth}
    if (size === WIDGET_SIZE.full) return WIDGET_WIDTH_RANGE_LIST.sm.map(() => containerWidth);
    return [0];
};


const selectAllWidgetWidthRange = (widgetSizeList: Array<WidgetSize>, containerWidth: number): Array<Array<Array<number>>> => {
    // Array for save each line's widget width and return
    const allWidgetWidthRange: Array<Array<Array<number>>> = [];
    // it runs shift() method, so should save length
    const widgetSizeListLength = widgetSizeList.length;

    // compare sum of one row's widget width
    let rowWidthSum = 0;
    // Array for save one row's widget width
    let rowWidgetWidthRange: Array<Array<number>> = [];

    for (let i = 0; i < widgetSizeListLength; i += 1) {
        // extract widget one by one
        const selectedWidgetSize: Array<number> = widgetSizeRangeExtractor(widgetSizeList.shift() as WidgetSize, containerWidth);
        rowWidthSum += selectedWidgetSize[0];

        const containerWidthWithGap = containerWidth - (rowWidgetWidthRange.length * GAP);
        // Compare the sum of widget sizes of one row with containerWidth to push the maximum value
        // and initialize it to the default value of the shifted card.
        if (rowWidthSum > containerWidthWithGap) {
            allWidgetWidthRange.push(rowWidgetWidthRange);
            rowWidgetWidthRange = [];
            rowWidthSum = selectedWidgetSize[0];
        }
        // Push after the comparison syntax because you need to find the maximum value of the widget size agreement available on one line.
        rowWidgetWidthRange.push(selectedWidgetSize);
    }

    // consider last element
    if (rowWidgetWidthRange.length) allWidgetWidthRange.push(rowWidgetWidthRange);

    return allWidgetWidthRange;
};


const allWidgetWidthReAligner = (allWidgetWidthRange: Array<Array<Array<number>>>, containerWidth: number): Array<Array<number>> => {
    const widthSelectPointer: Array<Array<number>> = [];
    const reAssignedWidgetWidthList: Array<Array<number>> = [];
    let rowWidthSum = 0;
    let reAssignedRowWidth: Array<number> = [];


    // Concept: https://www.notion.so/spaceone-io/Widget-width-assigner-Pointer-c4379b4cb4ce4053ad63405f58bcc261
    for (let i = 0; i < allWidgetWidthRange.length; i += 1) {
        const rowPointer: Array<number> = [];
        for (let j = 0; j < allWidgetWidthRange[i].length; j += 1) {
            rowPointer.push(0);
        }
        widthSelectPointer.push(rowPointer);
    }

    // i -> circuit each row
    for (let i = 0; i < allWidgetWidthRange.length; i += 1) {
        rowWidthSum = 0;
        reAssignedRowWidth = [];
        // j -> increase widget size as +80
        for (let j = 0; j < WIDGET_WIDTH_RANGE_LENGTH_MAX; j += 1) {
            const containerWidthWithGap = containerWidth - ((allWidgetWidthRange[i].length - 1) * GAP);
            rowWidthSum = 0;
            reAssignedRowWidth = [];
            // k -> circuit allWidgetWidthRange
            for (let k = 0; k < allWidgetWidthRange[i].length; k += 1) {
                widthSelectPointer[i].unshift(j);
                // l -> compare sum of each row width && push one row
                for (let l = 0; l < allWidgetWidthRange[i].length; l += 1) {
                    rowWidthSum += allWidgetWidthRange[i][l][widthSelectPointer[i][l]];

                    if (rowWidthSum > containerWidthWithGap) {
                        reAssignedWidgetWidthList.push(reAssignedRowWidth);
                        break;
                    }

                    if (rowWidthSum === containerWidthWithGap) {
                        reAssignedRowWidth.push(allWidgetWidthRange[i][l][widthSelectPointer[i][l]]);
                        reAssignedWidgetWidthList.push(reAssignedRowWidth);
                        break;
                    }

                    reAssignedRowWidth.push(allWidgetWidthRange[i][l][widthSelectPointer[i][l]]);
                }
                if (rowWidthSum >= containerWidthWithGap) break;
            }
            if (rowWidthSum >= containerWidthWithGap) break;
            // consider last element
            if (j === WIDGET_WIDTH_RANGE_LENGTH_MAX - 1 && reAssignedRowWidth.length) {
                reAssignedWidgetWidthList.push(reAssignedRowWidth);
            }
        }
    }

    return reAssignedWidgetWidthList;
};


export const widgetWidthAssigner = (widgetSizeList: Array<WidgetSize>, containerWidth: number): Array<Array<number>> => {
    // This function runs .shift(), so cloning object is needed.
    const _widgetSizeList = [...widgetSizeList];
    if (containerWidth < 800) return widgetSizeList.map(() => [containerWidth]);

    const allWidgetWidthRange = selectAllWidgetWidthRange(_widgetSizeList, containerWidth);
    return allWidgetWidthReAligner(allWidgetWidthRange, containerWidth);
};
