<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { find } from 'lodash';

import { PTab, PBadge } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';
import { numberFormatter } from '@cloudforet/utils';

import type { ProjectModel } from '@/api-clients/identity/project/schema/model';
import { ALERT_STATE } from '@/schema/monitoring/alert/constants';

import BetaMark from '@/common/components/marks/BetaMark.vue';
import { useProxyValue } from '@/common/composables/proxy-state';

import { PROJECT_ROUTE_V1 } from '@/services/project/v1/routes/route-constant';
import { useProjectDetailPageStore } from '@/services/project/v1/stores/project-detail-page-store';

interface Props {
    id?: string,
    item?: ProjectModel,
    tabs: TabItem[],
    activeTab: string,
}

const props = withDefaults(defineProps<Props>(), {
    id: undefined,
    item: undefined,
    tabs: () => [],
    activeTab: PROJECT_ROUTE_V1.DETAIL.TAB.SUMMARY._NAME,
});

const route = useRoute();
const router = useRouter();

const projectDetailPageStore = useProjectDetailPageStore();
const projectDetailPageState = projectDetailPageStore.state;

const emit = defineEmits<{(e: 'update:active-tab', value: string): void;}>();

const state = reactive({
    proxyActiveTab: useProxyValue('activeTab', props, emit),
    counts: computed(() => ({
        TRIGGERED: find(projectDetailPageState.alertCounts, { state: ALERT_STATE.TRIGGERED })?.total ?? 0,
    })),
});

const onChangeTab = (activeTab: string) => {
    if (activeTab === route.name) return;
    const isDashboardTab = activeTab.startsWith('public-dash-');
    const dashboardTabRoute = {
        name: PROJECT_ROUTE_V1.DETAIL.TAB.DASHBOARD._NAME,
        params: {
            id: props.id as string,
            dashboardId: activeTab,
        },
    };
    router.replace(isDashboardTab ? dashboardTabRoute : { name: activeTab }).catch(() => {});
};
</script>

<template>
    <p-tab v-if="props.item"
           :tabs="props.tabs"
           :active-tab.sync="state.proxyActiveTab"
           @change="onChangeTab"
    >
        <router-view />
        <template #extra="tab">
            <p-badge v-if="tab.label === $t('PROJECT.DETAIL.TAB_ALERT') && state.counts[ALERT_STATE.TRIGGERED] !== 0"
                     style-type="primary3"
                     badge-type="subtle"
            >
                {{ numberFormatter(state.counts[ALERT_STATE.TRIGGERED]) }}
            </p-badge>
            <beta-mark v-if="tab.name === 'projectAlert' || tab.name === 'projectNotifications'" />
        </template>
    </p-tab>
</template>

<style scoped lang="postcss">
.edit-button {
    margin-right: 0.5rem;
}
</style>
