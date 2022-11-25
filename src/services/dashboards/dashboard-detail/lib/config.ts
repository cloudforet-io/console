import lodash from 'lodash';

//
// If the RANGE varies for each size, the last element must be added up to the length of the largest RANGE among sizes.
// e.g.) Added 540, 620 in SM
// [320, 400, 480, 560, 640]
// [480, 560, 640, 640, 640]
// [640, 720, 800, 800, 800]
// [800, 880, 960, 960, 960

export const WIDGET_FRAME_WIDTH_RANGE_LIST = {
    SM: [320, 400, 480], // 0: SM
    MD: [480, 560, 640], // 1: MD
    LG: [640, 720, 800], // 2: LG
    XL: [800, 880, 960], // 3: XL
};
export const WIDGET_FRAME_WIDTH_RANGE_LENGTH_MAX = lodash.maxBy(
    Object.values(WIDGET_FRAME_WIDTH_RANGE_LIST).map((d) => d.length),
) as number;


export const WIDGET_FRAME_CONTAINER_MIN_WIDTH = 320;
export const WIDGET_FRAME_CONTAINER_MAX_WIDTH = 1840;
