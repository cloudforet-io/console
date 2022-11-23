/** NAMING
 * widgetFrameSize: string -> 'SM'|'MD'|'LG'|'XL'
 * widgetFrameWidth: number -> 320, 400... 880, 960
 * widgetFrameWidthRange: Array<number> -> [320, 400, 480]|[480, 560, 640]|[800, 880, 960]|[800, 880, 960]
 * rowWidgetFrameWidthRange: Array<Array<number>> -> [[MD_RANGE], [MD_RANGE], [SM_RANGE], [LG_RANGE]]
 * allWidgetFrameWidthRange: Array<Array<Array<number>>> -> [[[MD_RANGE], [MD_RANGE]], [[SM_RANGE], [[LG_RANGE]]]
 * rowWidgetFrameWidthList: Array<number> -> [320, 480]
 * allWidgetFrameWidthList: Array<Array<number>> -> [[320], [320, 480], [320, 480]]
* */

// RANGE 가 각 size 별로 달라지는 상황이 발생한다면, size 중 가장 큰 RANGE 의 length 까지 마지막 원소를 추가해야 합니다.
// e.g.) SM 에 540, 620 추가
// [320, 400, 480, 560, 640]
// [480, 560, 640, 640, 640]
// [640, 720, 800, 800, 800]
// [800, 880, 960, 960, 960

export const WIDGET_FRAME_WIDTH_RANGE_LIST = [
    [320, 400, 480], // 0: SM
    [480, 560, 640], // 1: MD
    [640, 720, 800], // 2: LG
    [800, 880, 960], // 3: XL
];

export const CONTAINER_MIN_WIDTH = 320;
