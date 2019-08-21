export const GlobalEnum = {
    TREE: Object.freeze({
        PROJECT: {
            PROJECT:{
                isLeaf: true
            },
            PROJECT_GROUP:{
                isLeaf: false
            }
        }
    }),
    LANGUAGES: Object.freeze({
        en: { value: 'en', text: 'English' },
        ko: { value: 'ko', text: '한국어' }
    }),
    SERVER_STATE: Object.freeze(
        {
            SERVICE: {
                msg: 'In Progress', //primary //fal-
                icon: 'fal fa-check',
                color: 'primary'
            },
            MAINTENANCE: {
                msg: '', //info
                icon: 'fal fa-traffic-cone',
                color: 'info'
            },
            CLOSED: {
                msg: 'Closed', //secondary
                icon: 'fal fa-minus',
                color: 'secondary'
            },
            DELETED: {
                msg: 'Deleted', //danger
                icon: 'fal fa-trash',
                color: 'danger'
            }
        }),
    COLLECT_STATE: Object.freeze(
        {
            NEW: {
                msg:  'New', //info
                icon: 'fal fa-lightbulb-on',
                color: 'info'
            },
            ACTIVE: {
                msg: 'Active', //primary
                icon: 'fal fa-check-circle',
                color: 'primary'
            },
            DISCONNECTED: {
                msg: 'Disconnected', //danger
                icon: 'fal fa-plug',
                color: 'danger'
            },
            DUPLICATED: {
                msg: 'Duplicated', // warning
                icon: 'fal fa-lightbulb-exclamation',
                color: 'warning'
            },
            UNMANAGED: {
                msg: 'Unmanaged', // secondary
                icon: 'fal fa-question-circle',
                color: 'secondary'
            }
        })
};
