import { Stat } from '@/lib/fluent-api/statistics/resource';
import { initReactive, StateToolSet } from '@/lib/toolset';

export const resourceByRegionProps = {
    getAction: {
        type: Function,
        default: (action: Stat<any>) => action.setResourceType('identity.ServiceAccount'),
    },
    projectFilter: {
        type: String,
        default: '',
    },
};

export interface ResourcesByRegionProps {
    getAction(api: Stat<any>): Stat<any>;
    projectFilter: string;
}

@StateToolSet<ResourcesByRegionProps>()
export class ServiceAccountsWidgetState {
    state: ResourcesByRegionProps;

    static initState(): ResourcesByRegionProps {
        return {
            getAction: action => action.setResourceType('identity.ServiceAccount'),
            projectFilter: '',
        };
    }

    constructor(initData: ResourcesByRegionProps = {} as ResourcesByRegionProps, lazy = false) {
        this.state = initReactive<ResourcesByRegionProps>(lazy, ServiceAccountsWidgetState.initState(), initData);
    }
}
