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
