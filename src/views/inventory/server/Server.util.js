import {
    alert, safe, other1, other2, gray,
} from '@/styles/_variables.scss';
import { statusBindFactory } from '@/components/molecules/status/Status.util';

export const serverStateFormatter = statusBindFactory({
    INSERVICE: {
        iconColor: safe,
        textColor: safe,
    },
    PENDING: {
        iconColor: other1,
        textColor: other1,
    },
    MAINTENANCE: {
        iconColor: other2,
        textColor: other2,

    },
    CLOSED: {
        iconColor: alert,
        textColor: alert,
    },
    DELETED: {
        iconColor: gray,
        textColor: gray,
    },
},
value => value.toLowerCase());
