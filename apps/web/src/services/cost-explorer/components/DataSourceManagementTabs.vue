<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router/composables';

import { clone } from 'lodash';

import { PTab } from '@cloudforet/mirinae';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { PageAccessMap } from '@/lib/access-control/config';
import type { MenuId } from '@/lib/menu/config';
import { MENU_ID } from '@/lib/menu/config';

import DataSourceManagementTabAccessRestriction
    from '@/services/cost-explorer/components/DataSourceManagementTabAccessRestriction.vue';
import DataSourceManagementTabDetailBaseInformation
    from '@/services/cost-explorer/components/DataSourceManagementTabDetailBaseInformation.vue';
import DataSourceManagementTabDetailJob from '@/services/cost-explorer/components/DataSourceManagementTabDetailJob.vue';
import DataSourceManagementTabLinkedAccount
    from '@/services/cost-explorer/components/DataSourceManagementTabLinkedAccount.vue';
import { COST_EXPLORER_ROUTE } from '@/services/cost-explorer/routes/route-constant';
import { useDataSourcesPageStore } from '@/services/cost-explorer/stores/data-sources-page-store';



const dataSourcesPageStore = useDataSourcesPageStore();
const dataSourcesPageState = dataSourcesPageStore.state;

const route = useRoute();

const storeState = reactive({
    activeTab: computed<string>(() => dataSourcesPageState.activeTab),
    pageAccessPermissionMap: computed<PageAccessMap>(() => store.getters['user/pageAccessPermissionMap']),
});
const state = reactive({
    selectedMenuId: computed(() => {
        const reversedMatched = clone(route.matched).reverse();
        const closestRoute = reversedMatched.find((d) => d.meta?.menuId !== undefined);
        const targetMenuId: MenuId = closestRoute?.meta?.menuId || MENU_ID.WORKSPACE_HOME;
        if (route.name === COST_EXPLORER_ROUTE.LANDING._NAME) {
            return '';
        }
        return targetMenuId;
    }),
    hasReadWriteAccess: computed<boolean|undefined>(() => storeState.pageAccessPermissionMap[state.selectedMenuId]?.write),
});
const tabState = reactive({
    tabs: computed(() => [
        { name: 'detail', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_DETAILS_TITLE') },
        { name: 'linked_account', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_LINKED_ACCOUNT_TITLE') },
        { name: 'data_collection_job', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_DETAILS_COLLECTION_JOB') },
        { name: 'access_restriction', label: i18n.t('BILLING.COST_MANAGEMENT.DATA_SOURCES.TAB_RESTRICTION') },
    ]),
});

const handleChangeTab = (tab: string) => {
    dataSourcesPageStore.setActiveTab(tab);
};
</script>

<template>
    <p-tab :tabs="tabState.tabs"
           :active-tab="storeState.activeTab"
           :class="storeState.activeTab"
           class="data-source-management-tabs"
           @change="handleChangeTab"
    >
        <template v-if="storeState.activeTab === 'detail'"
                  #detail
        >
            <data-source-management-tab-detail-base-information />
        </template>
        <template v-else-if="storeState.activeTab === 'linked_account'"
                  #linked_account
        >
            <data-source-management-tab-linked-account :has-read-write-access="state.hasReadWriteAccess" />
        </template>
        <template v-else-if="storeState.activeTab === 'data_collection_job'"
                  #data_collection_job
        >
            <data-source-management-tab-detail-job />
        </template>
        <template v-else-if="storeState.activeTab === 'access_restriction'"
                  #access_restriction
        >
            <data-source-management-tab-access-restriction :has-read-write-access="state.hasReadWriteAccess" />
        </template>
    </p-tab>
</template>
