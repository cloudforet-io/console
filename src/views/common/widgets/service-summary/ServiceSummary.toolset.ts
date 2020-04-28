import { Location } from 'vue-router';
import { colorset } from '@/lib/util';

import { Stat } from '@/lib/fluent-api/statistics/resource';


export const serviceSummaryProps = {
    title: {
        type: String,
        default: '',
    },
    to: {
        type: [String, Object],
        default: '/dashboard',
    },
    color: {
        type: String,
        default: colorset[0],
    },
    resourceType: {
        type: String,
        required: true,
        default: '',
    },
    getAction: {
        type: Function,
        default: api => api,
    },
};

export interface ServiceSummaryPropsType {
    title: string;
    to: Location | string;
    color: string;
    resourceType: string;
    getAction(api: Stat<any>): Stat<any>;
}
