import {
    WIDGET_FRAME_WIDTH_RANGE_LIST,
    WIDGET_FRAME_CONTAINER_MIN_WIDTH,
    WIDGET_FRAME_WIDTH_RANGE_LENGTH_MAX,
} from '@/services/dashboards/dashboard-detail/lib/config';

/** NAMING
 * widgetFrameSize: string -> 'SM'|'MD'|'LG'|'XL'
 * widgetFrameWidth: number -> 320, 400... 880, 960
 * widgetFrameWidthRange: Array<number> -> [320, 400, 480]|[480, 560, 640]|[800, 880, 960]|[800, 880, 960]
 * rowWidgetFrameWidthRange: Array<Array<number>> -> [[MD_RANGE], [MD_RANGE], [SM_RANGE], [LG_RANGE]]
 * allWidgetFrameWidthRange: Array<Array<Array<number>>> -> [[[MD_RANGE], [MD_RANGE]], [[SM_RANGE], [[LG_RANGE]]]
 * rowWidgetFrameWidthList: Array<number> -> [320, 480]
 * allWidgetFrameWidthList: Array<Array<number>> -> [[320], [320, 480], [320, 480]]
 * */

const widgetFrameSizeRangeExtractor = (size: string, containerWidth: number = WIDGET_FRAME_CONTAINER_MIN_WIDTH): Array<number> => {
    if (size === 'SM') return WIDGET_FRAME_WIDTH_RANGE_LIST.SM;
    if (size === 'MD') return WIDGET_FRAME_WIDTH_RANGE_LIST.MD;
    if (size === 'LG') return WIDGET_FRAME_WIDTH_RANGE_LIST.LG;
    if (size === 'XL') return WIDGET_FRAME_WIDTH_RANGE_LIST.XL;
    // WIDGET_FRAME_WIDTH_RANGE_LIST length, it will return filled by ${containerWidth}
    if (size === 'FULL') return WIDGET_FRAME_WIDTH_RANGE_LIST.SM.map(() => containerWidth);
    return [0];
};


const selectAllWidgetFrameWidthRange = (widgetFrameSizeList: Array<string>, containerWidth: number): Array<Array<Array<number>>> => {
    // Array for save each line's widgetFrame width and return
    const allWidgetFrameWidthRange: Array<Array<Array<number>>> = [];
    // it runs shift() method, so should save length
    const widgetFrameSizeListLength = widgetFrameSizeList.length;

    // compare sum of one row's widgetFrame width
    let rowWidthSum = 0;
    // Array for save one row's widget Frame width
    let rowWidgetFrameWidthRange: Array<Array<number>> = [];

    for (let i = 0; i < widgetFrameSizeListLength; i += 1) {
        // extract widgetFrame one by one
        const selectedWidgetFrameSize: Array<number> = widgetFrameSizeRangeExtractor(widgetFrameSizeList.shift() as string, containerWidth);
        rowWidthSum += selectedWidgetFrameSize[0];
        // Compare the sum of widgetFrame sizes of one row with containerWidth to push the maximum value
        // and initialize it to the default value of the shifted card.
        if (rowWidthSum > containerWidth) {
            allWidgetFrameWidthRange.push(rowWidgetFrameWidthRange);
            rowWidgetFrameWidthRange = [];
            rowWidthSum = selectedWidgetFrameSize[0];
        }
        // Push after the comparison syntax because you need to find the maximum value of the widgetFrame size agreement available on one line.
        rowWidgetFrameWidthRange.push(selectedWidgetFrameSize);
    }

    // consider last element
    if (rowWidgetFrameWidthRange.length) allWidgetFrameWidthRange.push(rowWidgetFrameWidthRange);

    return allWidgetFrameWidthRange;
};


const allWidgetFrameWidthReAligner = (allWidgetFrameWidthRange: Array<Array<Array<number>>>, containerWidth: number): Array<Array<number>> => {
    const widthSelectPointer: Array<Array<number>> = [];
    const reAssignedWidgetFrameWidthList: Array<Array<number>> = [];
    let rowWidthSum = 0;
    let reAssignedRowWidth: Array<number> = [];


    // Concept: https://www.notion.so/spaceone-io/WidgetFrame-width-assigner-Pointer-c4379b4cb4ce4053ad63405f58bcc261
    for (let i = 0; i < allWidgetFrameWidthRange.length; i += 1) {
        const rowPointer: Array<number> = [];
        for (let j = 0; j < allWidgetFrameWidthRange[i].length; j += 1) {
            rowPointer.push(0);
        }
        widthSelectPointer.push(rowPointer);
    }

    // i -> circuit each row
    for (let i = 0; i < allWidgetFrameWidthRange.length; i += 1) {
        rowWidthSum = 0;
        reAssignedRowWidth = [];
        // j -> increase widgetFrame size as +80
        for (let j = 0; j < WIDGET_FRAME_WIDTH_RANGE_LENGTH_MAX; j += 1) {
            // k -> circuit allWidgetFrameWidthRange
            for (let k = 0; k < allWidgetFrameWidthRange[i].length; k += 1) {
                rowWidthSum = 0;
                reAssignedRowWidth = [];
                widthSelectPointer[i].unshift(j);
                // l -> compare sum of each row width && push one row
                for (let l = 0; l < allWidgetFrameWidthRange[i].length; l += 1) {
                    rowWidthSum += allWidgetFrameWidthRange[i][l][widthSelectPointer[i][l]];

                    if (rowWidthSum > containerWidth) {
                        reAssignedWidgetFrameWidthList.push(reAssignedRowWidth);
                        break;
                    }

                    if (rowWidthSum === containerWidth) {
                        reAssignedRowWidth.push(allWidgetFrameWidthRange[i][l][widthSelectPointer[i][l]]);
                        reAssignedWidgetFrameWidthList.push(reAssignedRowWidth);
                        break;
                    }

                    reAssignedRowWidth.push(allWidgetFrameWidthRange[i][l][widthSelectPointer[i][l]]);
                }
                if (rowWidthSum >= containerWidth) break;
            }
            if (rowWidthSum >= containerWidth) break;
            // consider last element
            if (j === WIDGET_FRAME_WIDTH_RANGE_LENGTH_MAX - 1 && reAssignedRowWidth.length) {
                reAssignedWidgetFrameWidthList.push(reAssignedRowWidth);
            }
        }
    }

    return reAssignedWidgetFrameWidthList;
};

export const widgetFrameWidthAssigner = (widgetFrameSizeList: Array<string>, containerWidth: number): Array<Array<number>> => {
    if (containerWidth < 800) return widgetFrameSizeList.map(() => [containerWidth]);

    const allWidgetFrameWidthRange = selectAllWidgetFrameWidthRange(widgetFrameSizeList, containerWidth);
    return allWidgetFrameWidthReAligner(allWidgetFrameWidthRange, containerWidth);
};
