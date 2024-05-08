<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PTextButton,
} from '@spaceone/design-system';

import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { MetricReferenceMap, MetricReferenceItem } from '@/store/reference/metric-reference-store';

import { useProperRouteLocation } from '@/common/composables/proper-route-location';

import { ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/route-constant';


const METRIC_SERVER_ID = 'metric-managed-server-count';

interface Props {
    goToMetricServerPage?: boolean;
    provider?: string;
    group?: string;
    name?: string;
}
const props = withDefaults(defineProps<Props>(), {
    goToMetricServerPage: false,
    provider: '',
    group: '',
    name: '',
});
const router = useRouter();
const { getProperRouteLocation } = useProperRouteLocation();

const allReferenceStore = useAllReferenceStore();
const storeState = reactive({
    metrics: computed<MetricReferenceMap>(() => allReferenceStore.getters.metric),
});
const state = reactive({
    targetMetric: computed<MetricReferenceItem|undefined>(() => {
        if (props.goToMetricServerPage) {
            return Object.values(storeState.metrics).find((d) => d.key === METRIC_SERVER_ID);
        }
        const _refinedResourceType = `inventory.CloudService:${props.provider}.${props.group}.${props.name}`;
        return Object.values(storeState.metrics).find((d) => d.data.resource_type === _refinedResourceType);
    }),
    showMetricButton: computed<boolean>(() => !!state.targetMetric),
});

const handleClickGoToMetric = () => {
    window.open(router.resolve(getProperRouteLocation({
        name: ASSET_INVENTORY_ROUTE.METRIC_EXPLORER.DETAIL._NAME,
        params: {
            metricId: props.goToMetricServerPage ? METRIC_SERVER_ID : state.targetMetric.key,
        },
    })).href, '_blank');
};
</script>

<template>
    <div class="metric-button-wrapper">
        <p-text-button v-if="state.showMetricButton"
                       icon-right="ic_arrow-right-up"
                       @click="handleClickGoToMetric"
        >
            {{ $t('INVENTORY.CLOUD_SERVICE.MAIN.SHOW_IN_METRIC_EXPLORER') }}
        </p-text-button>
    </div>
</template>

<style lang="scss" scoped>
.metric-button-wrapper {
    height: 2rem;
    display: flex;
    align-items: center;
}
</style>
