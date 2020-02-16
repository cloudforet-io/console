export const GlobalEnum = {
    TREE: Object.freeze({
        PROJECT: {
            PROJECT: {
                type: 'PROJECT',
                root_able: false,
                accept: [],
                isLeaf: true,
            },
            PROJECT_GROUP: {
                type: 'PROJECT_GROUP',
                root_able: true,
                accept: ['PROJECT_GROUP', 'PROJECT'],
                isLeaf: false,
            },
        },
        DATA_CENTER: {
            REGION: {
                type: 'REGION',
                root_able: false,
                accept: ['ZONE'],
                isLeaf: false,
            },
            ZONE: {
                type: 'ZONE',
                root_able: false,
                accept: ['POOL'],
                isLeaf: false,
            },
            POOL: {
                type: 'POOL',
                root_able: false,
                accept: [],
                isLeaf: true,
            },
        },
    }),
    COLLECT_MODE: Object.freeze({
        ALL: { value: 'ALL', text: 'All' },
        CREATE: { value: 'CREATE', text: 'Create' },
        UPDATE: { value: 'UPDATE', text: 'Update' },
    }),
    LANGUAGES: Object.freeze({
        en: {
            value: 'en', text: 'English', nation: 'US', icon: 'flag-icon flag-icon-us',
        },
        ko: {
            value: 'ko', text: '한국어', nation: 'KR', icon: 'flag-icon flag-icon-kr',
        },
    }),
    COLLECTOR: Object.freeze({
        AWS: [{ file_name: 'aws-ec2', src: 'aws-ec2.svg', text: 'EC2' }, { file_name: 'aws-network', src: 'aws-network.svg', text: 'Network' }],
    }),
    JOB_STATE: Object.freeze(
        {
            PENDING: {
                msg: 'Pending',
                icon: 'fal fa-minus',
                color: 'primary',
            },
            INPROGRESS: {
                msg: 'In progress',
                icon: 'fal fa-minus',
                color: 'info',
            },
            SUCCESS: {
                msg: 'Success',
                icon: 'fal fa-check',
                color: 'primary',
            },
            CREATED: {
                msg: 'Created',
                icon: 'fal fa-minus-circle',
                color: 'warning',
            },
            FAILURE: {
                msg: 'Failure',
                icon: 'fal fa-traffic-cone',
                color: 'danger',
            },
            TIMEOUT: {
                msg: 'Time out',
                icon: 'fal fa-traffic-cone',
                color: 'secondary',
            },
            IDLE: {
                msg: 'Idle',
                icon: 'fal fa-traffic-cone',
                color: 'secondary',
            },
        },
    ),
    MEMBER_STATE: Object.freeze(
        {
            ENABLED: {
                msg: 'Enabled',
                icon: 'fal fa-check',
                color: 'primary',
            },
            DISABLED: {
                msg: 'Disabled',
                icon: 'fal fa-minus',
                color: 'info',
            },
            UNIDENTIFIED: {
                msg: 'Unidentified',
                icon: 'fal fa-traffic-cone',
                color: 'secondary',
            },
        },
    ),
    SERVER_STATE: Object.freeze(
        {
            INSERVICE: {
                msg: 'In-Service',
                icon: 'fas fa-check-circle',
                color: 'success',
            },
            MAINTENANCE: {
                msg: 'Maintenance',
                icon: 'fas fa-exclamation-triangle',
                color: 'warning',
            },
            CLOSED: {
                msg: 'Closed',
                icon: 'fas fa-times-circle',
                color: 'danger',
            },
            DELETED: {
                msg: 'Deleted',
                icon: 'fas fa-minus-circle',
                color: 'dark',
            },
        },
    ),
    SERVER_TYPE: Object.freeze(
        {
            VM: {
                msg: 'VM',
                color: 'success',
            },
        },
    ),
    PLATFORM_TYPE: Object.freeze(
        {
            AWS: {
                msg: 'AWS',
                color: 'warning',
            },
        },
    ),
    COLLECT_STATE: Object.freeze(
        {
            NEW: {
                msg: 'New', // info
                icon: 'fas fa-lightbulb-on',
                color: 'info',
            },
            ACTIVE: {
                msg: 'Active', // primary
                icon: 'fas fa-check-circle',
                color: 'primary',
            },
            DISCONNECTED: {
                msg: 'Disconnected', // danger
                icon: 'fas fa-plug',
                color: 'danger',
            },
            DUPLICATED: {
                msg: 'Duplicated', // warning
                icon: 'fas fa-exclamation-triangle',
                color: 'warning',
            },
            UNMANAGED: {
                msg: 'Unmanaged', // secondary
                icon: 'fas fa-question-circle',
                color: 'secondary',
            },
        },
    ),
    OPERATORS: Object.freeze({
        CONTAIN_IN: {
            string: 'contain_in',
            sign: ':',
        },
        IN: {
            string: 'in',
            sign: ':=',
        },
        GTE: {
            string: 'gte',
            sign: ':>',
        },
        LTE: {
            string: 'lte',
            sign: ':<',
        },
        NOT_IN: {
            string: 'not_in',
            sign: ':!',
        },
        REGEX_IN: {
            string: 'regex_in',
            sign: ':/',
        },
    }),
};
