<script lang="ts" setup>
import {
    computed, reactive,
} from 'vue';
import { useRouter } from 'vue-router/composables';

import {
    PEmpty, PTab, PDataTable, PBadge, PButton,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { i18n } from '@/translations';

import RoleManagementTabDetail from '@/services/administration/components/RoleManagementTabDetail.vue';
import { ROLE_TYPE_BADGE_OPTION } from '@/services/administration/constants/role-constant';
import { ADMINISTRATION_ROUTE } from '@/services/administration/routes/route-constant';
import { useRolePageStore } from '@/services/administration/store/role-page-store';

const rolePageStore = useRolePageStore();
const rolePageState = rolePageStore.$state;

const router = useRouter();

const state = reactive({
    fields: computed<DataTableField[]>(() => ([
        { name: 'name', label: 'Name' },
        { name: 'tags.description', label: 'Description', sortable: false },
        { name: 'role_type', label: 'Role Type' },
        { name: 'created_at', label: 'Created', sortable: false },
        { name: 'edit_button', label: ' ', sortable: false },
    ])),
    selectedRoleId: computed(() => rolePageStore.selectedRoles[0]?.role_id),
});

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

const handleEditRole = (id: string) => { router.push({ name: ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME, params: { id } }); };
</script>

<template>
    <section>
        <p-tab v-if="rolePageState.selectedIndices.length === 1"
               :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail>
                <role-management-tab-detail :role-id="state.selectedRoleId" />
            </template>
        </p-tab>
        <p-tab v-else-if="rolePageState.selectedIndices.length > 1"
               :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
        >
            <template #data>
                <p-data-table :fields="state.fields"
                              :sortable="false"
                              :selectable="false"
                              :items="rolePageStore.selectedRoles"
                              :col-copy="true"
                              class="selected-data-tab"
                >
                    <template #th-edit_button>
                        <span />
                    </template>
                    <template #col-role_type-format="{ value }">
                        <p-badge v-if="value"
                                 badge-type="solid-outline"
                                 :style-type="ROLE_TYPE_BADGE_OPTION[value].styleType"
                        >
                            {{ ROLE_TYPE_BADGE_OPTION[value] ? ROLE_TYPE_BADGE_OPTION[value].label : '' }}
                        </p-badge>
                    </template>
                    <template #[`col-tags.description-format`]="{ value }">
                        {{ value ? value : '--' }}
                    </template>
                    <template #col-edit_button-format="{ item }">
                        <p-button size="sm"
                                  style-type="tertiary"
                                  icon-left="ic_edit"
                                  @click="handleEditRole(item.role_id)"
                        >
                            {{ $t('IAM.ROLE.EDIT') }}
                        </p-button>
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
#empty-space {
    @apply text-primary2 mt-6;
    text-align: center;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
}
.selected-data-tab {
    @apply mt-8;
}
</style>
