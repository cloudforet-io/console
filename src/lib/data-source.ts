/* eslint-disable camelcase */
export const dateTimeViewType = {
    view_type: 'datetime',
    view_option: {
        source_type: 'timestamp',
        source_format: 'seconds',
    },
};

export const createAtVF = {
    name: 'Created at',
    key: 'created_at.seconds',
    ...dateTimeViewType,
};
export const updateAtVF = {
    name: 'Updated at',
    key: 'updated_at.seconds',
    ...dateTimeViewType,
};

export const deleteAtVF = {
    name: 'Deleted at',
    key: 'deleted_at.seconds',
    ...dateTimeViewType,
};
