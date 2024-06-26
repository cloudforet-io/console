export const WIDGET_WIDTH_CRITERIA = 8;

const getWidthRangeList = (n: number) => [...Array(36)].map((_, index) => n + index * WIDGET_WIDTH_CRITERIA);

export const WIDGET_WIDTH_RANGE_LIST = {
    sm: getWidthRangeList(320), // 320 ~ 880
    md: getWidthRangeList(480), // 480 ~ 960
    lg: getWidthRangeList(640), // 640 ~ 1200
    xl: getWidthRangeList(800), // 800 ~ 1360
};

export const WIDGET_CONTAINER_MIN_WIDTH = 320;
export const WIDGET_CONTAINER_MAX_WIDTH = 1840;

export const WIDGET_GAP = 8;

export const WIDGET_WIDTH_STR_MAP = {
    sm: 'Small',
    md: 'Medium',
    lg: 'Large',
    full: 'Full',
} as const;


export const WIDGET_SIZE = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
    full: 'full',
} as const;
