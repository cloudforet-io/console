export const GlobalEnum = {
    SERVER_STATE: Object.freeze(
        {
            SERVICE: {
                msg: Symbol('In Service'), //primary //fal-
                icon: 'fal fa-check',
                color: 'primary'
            },
            MAINTENANCE: {
                msg: Symbol('Maintenance'), //info
                icon: 'fal fa-traffic-cone',
                color: 'info'
            },
            CLOSED: {
                msg: Symbol('Closed'), //secondary
                icon: 'fal fa-minus',
                color: 'secondary'
            },
            DELETED: {
                msg: Symbol('Deleted'), //danger
                icon: 'fal fa-trash',
                color: 'danger'
            },
        }),
    COLLECT_STATE: Object.freeze(
        {
            NEW: {
                msg: Symbol('New'), //info
                icon: 'fal fa-lightbulb-on',
                color: 'info'
            },
            ACTIVE: {
                msg: Symbol('Active'), //primary
                icon: 'fal fa-check-circle',
                color: 'primary'
            },
            DISCONNECTED: {
                msg: Symbol('Disconnected'), //danger
                icon: 'fal fa-plug',
                color: 'danger'
            },
            DUPLICATED: {
                msg: Symbol('Duplicated'), // warning
                icon: 'fal fa-lightbulb-exclamation',
                color: 'warning'
            },
            UNMANAGED: {
                msg: Symbol('Unmanaged'), // secondary
                icon: 'fal fa-question-circle',
                color: 'secondary'
            },
        })
};
