<script lang="ts" setup>
import {
    computed, onMounted, onUnmounted, reactive,
} from 'vue';

import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PHorizontalLayout, PHeading, PButton, PTab, PHeadingLayout,
} from '@cloudforet/mirinae';

import { useAppApi } from '@/api-clients/identity/app/composables/use-app-api';
import { ROLE_TYPE } from '@/api-clients/identity/role/constant';
import type { RoleType } from '@/api-clients/identity/role/type';
import { useServiceQueryKey } from '@/query/core/query-key/use-service-query-key';
import { useScopedQuery } from '@/query/service-query/use-scoped-query';
import { i18n } from '@/translations';

import { useAppContextStore } from '@/store/app-context/app-context-store';
import { useUserStore } from '@/store/user/user-store';

import { usePageEditableStatus } from '@/common/composables/page-editable-status';

import AppAPIKeyGRPCEndpointsTab from '@/services/iam/components/AppAPIKeyGRPCEndpointsTab.vue';
import AppAPIKeyRestEndpointsTab from '@/services/iam/components/AppAPIKeyRestEndpointsTab.vue';
import AppManagementTable from '@/services/iam/components/AppManagementTable.vue';
import { APP_DROPDOWN_MODAL_TYPE } from '@/services/iam/constants/app-constant';
import { useAppPageStore } from '@/services/iam/store/app-page-store';

const appPageStore = useAppPageStore();
const appContextStore = useAppContextStore();

const userStore = useUserStore();

const { hasReadWriteAccess } = usePageEditableStatus();

const storeState = reactive({
    roleType: computed<RoleType|undefined>(() => userStore.state.roleType),
    isAdminMode: computed(() => appContextStore.getters.isAdminMode),
});

const tabs = [{
    name: 'rest',
    label: 'REST',
}, {
    name: 'gRPC',
    label: 'gRPC',
}];
const state = reactive({
    activeTab: 'rest',
    userId: computed<string|undefined>(() => userStore.state.userId),
});

const appListApiQueryHelper = new ApiQueryHelper().setCountOnly();
const { appAPI } = useAppApi();
const { key: appListQueryKey, params: appListQueryParams } = useServiceQueryKey('identity', 'app', 'list', {
    params: computed(() => {
        appListApiQueryHelper.setFilters([
            storeState.isAdminMode ? { k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: '=' } : { k: 'role_type', v: ROLE_TYPE.DOMAIN_ADMIN, o: '!=' },
        ]);
        return {
            query: appListApiQueryHelper.data,
        };
    }),
});
const { data: appListData } = useScopedQuery({
    queryKey: appListQueryKey,
    queryFn: () => appAPI.list(appListQueryParams.value),
    gcTime: 1000 * 60 * 2,
    staleTime: 1000 * 30,
}, ['DOMAIN', 'WORKSPACE']);

/* Component */
const handleCreateApp = () => {
    appPageStore.setModalInfo(APP_DROPDOWN_MODAL_TYPE.CREATE, i18n.t('IAM.APP.MODAL.CREATE_TITLE') as string);
    appPageStore.setModalVisible('form', true);
};

onMounted(async () => {
    await appPageStore.listRoles();
});

onUnmounted(() => {
    appPageStore.$dispose();
    appPageStore.$reset();
});
</script>

<template>
    <section class="app-page">
        <p-heading-layout class="mb-6">
            <template #heading>
                <p-heading :title="$t('IAM.APP.TITLE')"
                           use-selected-count
                           use-total-count
                           :total-count="appListData?.total_count || 0"
                />
            </template>
            <template #extra>
                <p-button v-if="hasReadWriteAccess && storeState.roleType !== ROLE_TYPE.WORKSPACE_MEMBER"
                          style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateApp"
                >
                    {{ $t('IAM.APP.CREATE') }}
                </p-button>
            </template>
        </p-heading-layout>
        <p-horizontal-layout class="role-toolbox-layout">
            <template #container="{ height }">
                <app-management-table :table-height="height"
                                      :has-read-write-access="hasReadWriteAccess"
                />
            </template>
        </p-horizontal-layout>
        <p-tab :tabs="tabs"
               :active-tab.sync="state.activeTab"
        >
            <template #rest>
                <app-a-p-i-key-rest-endpoints-tab />
            </template>
            <template #gRPC>
                <app-a-p-i-key-g-r-p-c-endpoints-tab />
            </template>
        </p-tab>
    </section>
</template>

<style lang="postcss" scoped>
.app-page {
    @apply mx-0;
    max-width: 100%;
}

/* custom design-system component - p-horizontal-layout */
:deep(.role-toolbox-layout) {
    .horizontal-contents {
        overflow: unset;
    }
}
</style>
