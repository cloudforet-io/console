<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';

import {
    PEmpty, PTab, PDataTable,
} from '@spaceone/design-system';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import RoleManagementTabDetail from '@/services/administration/components/RoleManagementTabDetail.vue';
import { useRoleFormatter } from '@/services/administration/composables/refined-table-data';
import { ROLE_TAB_TABLE_FIELDS } from '@/services/administration/constants/role-constant';
import { useRolePageStore } from '@/services/administration/store/role-page-store';

const rolePageStore = useRolePageStore();
const rolePageState = rolePageStore.$state;

const singleItemTabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { label: i18n.t('IAM.ROLE.DETAIL.DETAILS'), name: 'detail', keepAlive: true },
    ])),
    activeTab: 'detail',
});
const multiItemTabState = reactive({
    tabs: computed<TabItem[]>(() => ([
        { name: 'data', label: i18n.t('IAM.ROLE.DETAIL.SELECTED_DATA'), keepAlive: true },
    ])),
    activeTab: 'data',
});
</script>

<template>
    <section class="role-management-tab">
        <p-tab v-if="rolePageState.selectedIndices.length === 1"
               :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail>
                <role-management-tab-detail />
            </template>
        </p-tab>
        <p-tab v-else-if="rolePageState.selectedIndices.length > 1"
               :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
        >
            <template #data>
                <p-data-table :fields="ROLE_TAB_TABLE_FIELDS"
                              :sortable="false"
                              :selectable="false"
                              :items="rolePageStore.selectedRoles"
                              :col-copy="true"
                              class="selected-data-tab"
                >
                    <template #col-role_type-format="{ value }">
                        <span class="role-type">
                            <img :src="useRoleFormatter(value).image"
                                 alt="role-type-icon"
                                 class="role-type-icon"
                            >
                            <span>{{ useRoleFormatter(value).name }}</span>
                        </span>
                    </template>
                </p-data-table>
            </template>
        </p-tab>
        <div v-else
             id="empty-space"
        >
            <p-empty>{{ $t('IDENTITY.USER.MAIN.NO_SELECTED') }}</p-empty>
        </div>
    </section>
</template>

<style lang="postcss" scoped>
.role-management-tab {
    #empty-space {
        @apply text-primary2 mt-6;
        text-align: center;
        margin-bottom: 0.5rem;
        font-size: 1.5rem;
    }
    .selected-data-tab {
        @apply mt-8;
    }
    .role-type {
        @apply flex items-center;
        gap: 0.5rem;
        .role-type-icon {
            @apply rounded-full;
            width: 1rem;
            height: 1rem;
        }
    }
}

</style>
