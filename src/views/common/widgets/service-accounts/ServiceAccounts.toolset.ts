import { Stat } from '@/lib/fluent-api/statistics/resource';
import { initReactive, StateToolSet } from '@/lib/toolset';

export const serviceAccountsProps = {
    getAction: {
        type: Function,
        default: (action: Stat<any>) => action.setResourceType('identity.ServiceAccount'),
    },
};

export interface ServiceAccountsPropsType {
    getAction(api: Stat<any>): Stat<any>;
}

@StateToolSet<ServiceAccountsPropsType>()
export class ServiceAccountsWidgetState {
    state: ServiceAccountsPropsType;

    static initState(): ServiceAccountsPropsType {
        return {
            getAction: action => action.setResourceType('identity.ServiceAccount'),
        };
    }

    constructor(initData: ServiceAccountsPropsType = {} as ServiceAccountsPropsType, lazy = false) {
        this.state = initReactive<ServiceAccountsPropsType>(lazy, ServiceAccountsWidgetState.initState(), initData);
    }
}
