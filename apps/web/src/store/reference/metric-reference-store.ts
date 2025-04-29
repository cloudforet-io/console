import { asyncComputed } from '@vueuse/core';
import { computed, reactive } from 'vue';

import { defineStore } from 'pinia';

import { SpaceConnector } from '@cloudforet/core-lib/space-connector';

import type { ListResponse } from '@/api-clients/_common/schema/api-verbs/list';
import type { MetricListParameters } from '@/schema/inventory/metric/api-verbs/list';
import type { MetricModel } from '@/schema/inventory/metric/model';

import { useAuthorizationStore } from '@/store/authorization/authorization-store';
import type {
    ReferenceLoadOptions, ReferenceItem, ReferenceMap,
    ReferenceTypeInfo,
} from '@/store/reference/type';

import ErrorHandler from '@/common/composables/error/errorHandler';



export type MetricReferenceItem = Required<Pick<ReferenceItem<Partial<MetricModel>>, 'key'|'label'|'name'|'data'>>;
export type MetricReferenceMap = ReferenceMap<MetricReferenceItem>;

const LOAD_TTL = 1000 * 60 * 60 * 3; // 3 hours
let lastLoadedTime = 0;

export const useMetricReferenceStore = defineStore('reference-metric', () => {
    const authorizationStore = useAuthorizationStore();
    const state = reactive({
        items: null as MetricReferenceMap | null,
    });

    const getters = reactive({
        metricItems: asyncComputed<MetricReferenceMap>(async () => {
            if (!authorizationStore.state.currentGrantInfo?.scope || authorizationStore.state.currentGrantInfo?.scope === 'USER') return {};
            if (state.items === null) await load();
            return state.items ?? {};
        }, {}, { lazy: true }),
        metricTypeInfo: computed<ReferenceTypeInfo>(() => ({
            type: 'metric',
            key: 'metric_id',
            name: 'name',
            referenceMap: getters.metricItems,
        })),
    });

    const load = async (options?: ReferenceLoadOptions) => {
        const currentTime = new Date().getTime();

        if (
            ((lastLoadedTime !== 0 && currentTime - lastLoadedTime < LOAD_TTL)
                || (options?.lazyLoad && state.items)
            ) && !options?.force
        ) return;

        const referenceMap: MetricReferenceMap = {};
        try {
            const response = await SpaceConnector.clientV2.inventory.metric.list<MetricListParameters, ListResponse<MetricModel>>({
                query: {
                    only: ['metric_id', 'name', 'namespace_id', 'is_managed', 'resource_type', 'unit', 'labels_info', 'resource_group'],
                },
            }, { timeout: 3000 });

            response.results?.forEach((metricInfo: MetricModel): void => {
                referenceMap[metricInfo.metric_id] = {
                    key: metricInfo.metric_id,
                    label: metricInfo.name,
                    name: metricInfo.name,
                    data: {
                        namespace_id: metricInfo.namespace_id,
                        is_managed: metricInfo.is_managed,
                        resource_type: metricInfo.resource_type,
                        resource_group: metricInfo.resource_group,
                        unit: metricInfo.unit,
                        labels_info: metricInfo.labels_info,
                    },
                };
            });
            state.items = referenceMap;
            lastLoadedTime = currentTime;
        } catch (e) {
            ErrorHandler.handleError(e);
        }
    };

    const sync = async (metricInfo: MetricModel) => {
        state.items = {
            ...state.items,
            [metricInfo.metric_id]: {
                key: metricInfo.metric_id,
                label: metricInfo.name,
                name: metricInfo.name,
                data: {
                    namespace_id: metricInfo.namespace_id,
                    is_managed: metricInfo.is_managed,
                    resource_type: metricInfo.resource_type,
                    unit: metricInfo.unit,
                    labels_info: metricInfo.labels_info,
                },
            },
        };
    };

    const flush = () => {
        state.items = null;
        lastLoadedTime = 0;
    };

    const actions = {
        load,
        sync,
        flush,
    };

    return {
        state,
        getters,
        ...actions,
    };
});

