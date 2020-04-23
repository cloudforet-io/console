import { HelperToolSet, initReactive, StateToolSet } from '@/lib/toolset';
import { UnwrapRef } from '@vue/composition-api/dist/reactivity';
import { DataSourceResp, STATISTICS_TYPE } from '@/lib/fluent-api/monitoring/type';
import _ from 'lodash';
import { watch } from '@vue/composition-api';
import Metric, { MetricList } from '@/lib/fluent-api/monitoring/metric';
import { fluentApi } from '@/lib/fluent-api';

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
    dataTools: { // aws cloud watch, data dog, ....
        type: Array,
        default: () => [],
        validator(dataTools) {
            return dataTools.every(d => d.id && d.name);
        },
    },
    // statisticsTypes: {
    //     type: Array,
    //     default: () => [],
    // },
    viewType: {
        type: Object,
        default: () => ({}),
    },
    // apiHandler: {
    //     type: Object,
    //     default: () => ({}),
    //     validator(api: MetricList) {
    //         return api.getResourceType() && api.getId();
    //     },
    // },
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
    // statisticsTypes: STATISTICS_TYPE[];
    // apiHandler: MetricList;
}

@StateToolSet<MonitoringProps>()
export class MonitoringState<D, S extends MonitoringProps = MonitoringProps> {
    state: UnwrapRef<S & D>;

    static initState(): MonitoringProps {
        return {
            resourceType: '',
            resources: [],
            dataTools: [],
            // statisticsTypes: [],
            // apiHandler: fluentApi.monitoring().metric().list(),
        };
    }

    constructor(initData: D = {} as D, lazy = false) {
        this.state = initReactive<UnwrapRef<S & D>>(lazy, MonitoringState.initState(), initData);
    }
}


@HelperToolSet()
export class MonitoringToolSet<D> extends MonitoringState<D> {
    idField: string;

    // eslint-disable-next-line no-empty-function
    static initToolSet() {}

    constructor(idField: string, resourceType: string, initData: D = {} as D) {
        super({ resourceType, ...initData });
        this.idField = idField;
    }

    setDataTools(data: DataSourceResp[]): void {
        this.state.dataTools = _.chain(data).map((d) => {
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

    // setStatisticsTypes(data: DataSourceResp[]): void {
    //     this.state.statisticsTypes = _.reduce(data,
    //         (stats, d) => [...stats, ...(d.plugin_info.options.supported_stat || [])],
    //         [] as STATISTICS_TYPE[]);
    // }

    setResources(resourceData: any) {
        this.state.resources = resourceData.map(d => ({
            id: _.get(d, this.idField),
            name: d.name,
        }));
    }
}
