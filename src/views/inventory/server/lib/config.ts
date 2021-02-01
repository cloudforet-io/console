import { StatusProps } from '@spaceone/design-system/dist/src/data-display/status/type';
import { Badge } from '@spaceone/design-system/dist/src/data-display/badges/type';


type Enum<T> = Record<string, T>
export const COLLECTION_STATE: Enum<StatusProps> = {
    ACTIVE: {
        text: 'Active',
        icon: 'ic_state_active',
    },
    DUPLICATED: {
        text: 'Duplicated',
        icon: 'ic_state_duplicated',
    },
    DISCONNECTED: {
        text: 'Disconnected',
        icon: 'ic_state_disconnected',
    },
    MANUAL: {
        text: 'Manual',
        icon: 'ic_state_manual',
    },
};

export const LIFE_CYCLE: Enum<StatusProps> = {
    INSERVICE: {
        text: 'In Service',
        iconColor: 'green.500',
    },
    MAINTENANCE: {
        text: 'Maintenance',
        iconColor: 'yellow.500',
    },
    CLOSED: {
        text: 'Closed',
        textColor: 'red.500',
        iconColor: 'red.500',
    },
    DELETED: {
        text: 'Deleted',
        textColor: 'gray.500',
        iconColor: 'gray.500',
    },
};

export const SERVER_TYPE: Enum<Partial<Badge>> = {
    VM: {
        backgroundColor: 'indigo.500',
        outline: true,
    },
    BAREMETAL: {
        backgroundColor: 'coral.600',
        outline: true,
    },
    HYPERVISOR: {
        backgroundColor: 'peacock.500',
        outline: true,
    },
    UNKNOWN: {
        backgroundColor: 'gray.500',
        outline: true,
    },
};
