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
    api: {
        type: Object,
        // eslint-disable-next-line no-empty-function
        default: () => ({}),
        validator(api) {
            return true;// api instanceof HistoryQueryAPI;
        },
    },
};

export interface ServiceSummaryPropsType {
    title: string;
    to: Location | string;
    color: string;
    api: any;// HistoryQueryAPI<any, any>;
}
