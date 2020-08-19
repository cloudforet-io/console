import {
    HelperToolSet, initReactive, StateToolSet,
} from '@/components/util/toolset-helpers';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { DataSourceResp, STATISTICS_TYPE } from '@/lib/fluent-api/monitoring/type';
import { get, chain } from 'lodash';
import { computed } from '@vue/composition-api';
import { forceRefArg } from '@/lib/type';

export const monitoringProps = {
    resourceType: {
        type: String,
        default: null,
    },
    resources: {
        type: Array,
        default: () => [],
        validator(resources) {
            return resources.every(resource => resource.id);
        },
    },
    viewType: {
        type: Object,
        default: () => ({}),
    },
};

export interface MonitoringResourceType {
    id: string;
    name?: string;
}

export interface DataToolType {
    id: string;
    name: string;
    statisticsTypes: STATISTICS_TYPE[];
}

export interface MonitoringProps {
    resourceType: string;
    resources: MonitoringResourceType[];
    dataTools: DataToolType[];
}

@StateToolSet<MonitoringProps>()
export class MonitoringState<D, S extends MonitoringProps = MonitoringProps> {
    state: UnwrapRef<S & D>;

    static initState(): MonitoringProps {
        return {
            resourceType: '',
            resources: [],
            dataTools: [],
        };
    }

    constructor(initData: D = {} as D, lazy = false) {
        this.state = initReactive<UnwrapRef<S & D>>(lazy, MonitoringState.initState(), initData);
    }
}


@HelperToolSet()
export class MonitoringToolSet<D=any> extends MonitoringState<D> {
    // eslint-disable-next-line no-empty-function
    static initToolSet(_this: MonitoringToolSet, targetResources: forceRefArg<any[]>) {
        // @ts-ignore
        _this.state.resources = computed(() => targetResources.value.map(d => ({
            id: get(d, _this.idField),
            name: d.name,
        })));
    }

    constructor(public idField: string, resourceType: string, target: forceRefArg<any[]>, initData: D = {} as D) {
        super({ resourceType, ...initData });
        MonitoringToolSet.initToolSet(this, target);
    }

    setDataTools(data: DataSourceResp[]): void {
        this.state.dataTools = chain(data).map((d) => {
            if (d.plugin_info.options.supported_resource_type.some(t => this.state.resourceType === t)) {
                return {
                    id: d.data_source_id,
                    name: d.name,
                    statisticsTypes: d.plugin_info.options.supported_stat || [STATISTICS_TYPE.average],
                };
            }
            return undefined;
        }).compact().uniqBy('id')
            .value();
    }
}
