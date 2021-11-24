export const CHART_TYPE = Object.freeze({
    LINE: 'LINE',
    STACKED_LINE: 'STACKED_LINE',
    COLUMN: 'COLUMN',
    STACKED_COLUMN: 'STACKED_COLUMN',
    DONUT: 'DONUT',
});
export type CHART_TYPE = typeof CHART_TYPE[keyof typeof CHART_TYPE];


export const REQUEST_TYPE = Object.freeze({
    SAVE: 'SAVE',
    EDIT: 'EDIT',
});

export type REQUEST_TYPE = typeof REQUEST_TYPE[keyof typeof REQUEST_TYPE];

export const QUERY_VISIBILITY_TYPE = Object.freeze({
    PUBLIC: 'PUBLIC',
    PRIVATE: 'PRIVATE',
});

export type QUERY_VISIBILITY_TYPE = typeof QUERY_VISIBILITY_TYPE[keyof typeof QUERY_VISIBILITY_TYPE];
