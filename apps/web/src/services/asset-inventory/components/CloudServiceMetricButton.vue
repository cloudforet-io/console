<script lang="ts" setup>
import { computed, reactive } from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PTextButton,
} from '@cloudforet/mirinae';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserWorkspaceStore } from '@/store/app-context/workspace/user-workspace-store';
import { useAllReferenceStore } from '@/store/reference/all-reference-store';
import type { MetricReferenceMap, MetricReferenceItem } from '@/store/reference/metric-reference-store';


import { ADMIN_ASSET_INVENTORY_ROUTE } from '@/services/asset-inventory/routes/admin/route-constant';
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

const allReferenceStore = useAllReferenceStore();
const appContextStore = useAppContextStore();
const userWorkspaceStore = useUserWorkspaceStore();
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
    window.open(router.resolve({
        name: appContextStore.getters.isAdminMode ? ADMIN_ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME : ASSET_INVENTORY_ROUTE.CLOUD_SERVICE.DETAIL._NAME,
        params: {
            workspaceId: appContextStore.getters.isAdminMode ? undefined : userWorkspaceStore.getters.currentWorkspaceId,
            metricId: props.goToMetricServerPage ? METRIC_SERVER_ID : state.targetMetric.key,
        },
    }).href, '_blank');
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
