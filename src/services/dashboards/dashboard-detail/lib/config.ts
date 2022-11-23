/**
 * widgetFrameSize: string -> 'SM'|'MD'|'LG'|'XL'
 * widgetFrameWidth: number -> 320, 400... 880, 960
 * widgetFrameWidthRange: Array<number> -> [320, 400, 480]|[480, 560, 640]|[800, 880, 960]|[800, 880, 960]
 * rowWidgetFrameWidthRange: Array<Array<number>> -> [[MD_RANGE], [MD_RANGE], [SM_RANGE], [LG_RANGE]]
 * allWidgetFrameWidthRange: Array<Array<Array<number>>> -> [[[MD_RANGE], [MD_RANGE]], [[SM_RANGE], [[LG_RANGE]]]
 * rowWidgetFrameWidthList: Array<number> -> [320, 480]
 * allWidgetFrameWidthList: Array<Array<number>> -> [[320], [320, 480], [320, 480]]
* */

export const CARD_WIDTH_RANGE_LIST = [
    [320, 400, 480], // 0: SM
    [480, 560, 640], // 1: MD
    [640, 720, 800], // 2: LG
    [800, 880, 960], // 3: XL
];

export const CONTAINER_MIN_WIDTH = 320;
