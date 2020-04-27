import { Location } from 'vue-router';
import { colorset } from '@/lib/util';

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
};

export interface ServiceSummaryPropsType {
    title: string;
    to: Location | string;
    color: string;
    resourceType: string;
}
