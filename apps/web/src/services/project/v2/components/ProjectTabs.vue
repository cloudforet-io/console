<script setup lang="ts">
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router/composables';

import { PTab } from '@cloudforet/mirinae';
import type { TabItem } from '@cloudforet/mirinae/types/navigation/tabs/tab/type';

import type { ProjectModel } from '@/api-clients/identity/project/schema/model';

import { useProxyValue } from '@/common/composables/proxy-state';

import { PROJECT_ROUTE_V2 } from '@/services/project/v2/routes/route-constant';

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
    // TODO: check routes
    activeTab: PROJECT_ROUTE_V2._NAME,
});

const route = useRoute();
const router = useRouter();

const emit = defineEmits<{(e: 'update:active-tab', value: string): void;}>();

const state = reactive({
    proxyActiveTab: useProxyValue('activeTab', props, emit),
});

const onChangeTab = (activeTab: string) => {
    if (activeTab === route.name) return;
    const isDashboardTab = activeTab.startsWith('public-dash-');
    const dashboardTabRoute = {
        // TODO: check route
        name: PROJECT_ROUTE_V2._NAME,
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
    </p-tab>
</template>

<style scoped lang="postcss">
.edit-button {
    margin-right: 0.5rem;
}
</style>
