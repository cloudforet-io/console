import { Location } from 'vue-router';
import { colorset } from '@/lib/util';

import { Stat } from '@/lib/fluent-api/statistics/resource';
import { initReactive, StateToolSet } from '@/lib/toolset';
import { HistoryStat } from '@/lib/fluent-api/statistics/history';


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
    getAction: {
        type: Function,
        default: api => api,
    },
    getTrendAction: {
        type: Function,
        default: api => api,
    },
};

export interface Value {
    count: number;
}

export interface Trend {
    count: string;
    date: number;
}

export interface ServiceSummaryPropsType {
    title: string;
    to: Location | string;
    color: string;
    getAction(api: Stat<Value>): Stat<Value>;
    getTrendAction(api: HistoryStat<Trend>): HistoryStat<Trend>;
}


@StateToolSet<ServiceSummaryPropsType>()
export class ServiceSummaryWidgetState {
    state: ServiceSummaryPropsType;

    static initState(): ServiceSummaryPropsType {
        return {
            title: '',
            to: '/dashboard',
            color: colorset[0],
            getAction: action => action,
            getTrendAction: action => action,
        };
    }

    constructor(initData: ServiceSummaryPropsType = {} as ServiceSummaryPropsType, lazy = false) {
        this.state = initReactive<ServiceSummaryPropsType>(lazy, ServiceSummaryWidgetState.initState(), initData);
    }
}
