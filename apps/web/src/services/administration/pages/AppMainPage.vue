<script lang="ts" setup>
import { computed, onUnmounted, reactive } from 'vue';

import {
    PHorizontalLayout, PHeading, PButton, PTab,
} from '@spaceone/design-system';
import { cloneDeep } from 'lodash';

import { ROLE_TYPE } from '@/schema/identity/role/constant';
import { store } from '@/store';
import { i18n } from '@/translations';

import AppAPIKeyGRPCEndpointsTab from '@/services/administration/components/AppAPIKeyGRPCEndpointsTab.vue';
import AppAPIKeyRestEndpointsTab from '@/services/administration/components/AppAPIKeyRestEndpointsTab.vue';
import AppManagementTable from '@/services/administration/components/AppManagementTable.vue';
import { APP_DROPDOWN_MODAL_TYPE } from '@/services/administration/constants/app-constant';
import { useAppPageStore } from '@/services/administration/store/app-page-store';

const appPageStore = useAppPageStore();
const appPageState = appPageStore.$state;

const storeState = reactive({
    roleType: computed(() => store.state.user.roleType),
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
    userId: computed(() => store.state.user.userId),
});

/* Component */
const handleCreateApp = () => {
    appPageStore.$patch((_state) => {
        _state.modal.type = APP_DROPDOWN_MODAL_TYPE.CREATE;
        _state.modal.title = i18n.t('IAM.APP.MODAL.CREATE_TITLE') as string;
        _state.modal.visible.form = true;
        _state.modal = cloneDeep(_state.modal);
    });
};

onUnmounted(() => {
    appPageStore.$dispose();
    appPageStore.$reset();
});
</script>

<template>
    <section class="app-page">
        <p-heading :title="$t('IAM.APP.TITLE')"
                   use-selected-count
                   use-total-count
                   :total-count="appPageState.totalCount"
        >
            <template #extra>
                <p-button v-if="storeState.roleType !== ROLE_TYPE.WORKSPACE_MEMBER"
                          style-type="primary"
                          icon-left="ic_plus_bold"
                          @click="handleCreateApp"
                >
                    {{ $t('IAM.APP.CREATE') }}
                </p-button>
            </template>
        </p-heading>
        <p-horizontal-layout class="role-toolbox-layout">
            <template #container="{ height }">
                <app-management-table :table-height="height" />
            </template>
        </p-horizontal-layout>
        <p-tab v-model="state.activeTab"
               :tabs="tabs"
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
