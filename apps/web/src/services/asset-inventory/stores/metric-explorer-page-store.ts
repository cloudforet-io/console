import { reactive } from 'vue';

import { defineStore } from 'pinia';

import { GRANULARITY } from '@/services/asset-inventory/constants/metric-explorer-constant';
import type { Granularity, Period, RelativePeriod } from '@/services/asset-inventory/types/metric-explorer-type';


export const useMetricExplorerPageStore = defineStore('metric-explorer-page', () => {
    const state = reactive({
        granularity: GRANULARITY.MONTHLY as Granularity,
        period: undefined as Period|undefined,
        relativePeriod: undefined as RelativePeriod|undefined,
        filters: {} as Record<string, string[]>,
    });

    /* Mutations */
    const setGranularity = (granularity: Granularity) => {
        state.granularity = granularity;
    };
    const setPeriod = (period?: Period) => {
        state.period = period;
    };
    const setRelativePeriod = (relativePeriod?: RelativePeriod) => {
        state.relativePeriod = relativePeriod;
    };

    /* Actions */
    const reset = () => {
        state.granularity = GRANULARITY.MONTHLY;
        state.period = undefined;
        state.relativePeriod = undefined;
        state.filters = {};
    };

    const actions = {
        reset,
    };
    const mutations = {
        setGranularity,
        setPeriod,
        setRelativePeriod,
    };

    return {
        state,
        ...mutations,
        ...actions,
    };
});
