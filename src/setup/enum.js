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
        en: { value: 'en', text: 'English' , nation: 'US', icon: 'flag-icon flag-icon-us' },
        ko: { value: 'ko', text: '한국어', nation: 'KR', icon: 'flag-icon flag-icon-kr' }
    }),
    MEMBER_STATE: Object.freeze(
        {
            ENABLED: {
                msg: 'Enabled',
                icon: 'fal fa-check',
                color: 'primary'
            },
            DISABLED: {
                msg:  'Disabled',
                icon: 'fal fa-minus',
                color: 'info'
            },
            UNIDENTIFIED: {
                msg: 'Unidentified',
                icon:  'fal fa-traffic-cone',
                color: 'secondary'
            }
        }),
    SERVER_STATE: Object.freeze(
        {
            SERVICE: {
                msg: 'In Progress', //primary
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
        }),
    OPERATORS: Object.freeze({
        CONTAIN_IN: {
            string: 'contain_in',
            sign: ':'
        },
        IN: {
            string: 'in',
            sign: ':='
        },
        GTE: {
            string: 'gte',
            sign: ':>'
        },
        LTE: {
            string: 'lte',
            sign: ':<'
        },
        NOT_IN: {
            string: 'not_in',
            sign: ':!'
        },
        REGEX_IN: {
            string: 'regex_in',
            sign: ':/'
        }
    })
};
