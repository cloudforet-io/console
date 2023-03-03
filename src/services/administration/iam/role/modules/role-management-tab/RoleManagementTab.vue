<template>
    <section>
        <p-tab v-if="selectedIndex.length === 1"
               :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail>
                <role-detail :role-id="selectedRoleId" />
            </template>
        </p-tab>
        <p-tab v-else-if="selectedIndex.length > 1"
               :tabs="multiItemTabState.tabs"
               :active-tab.sync="multiItemTabState.activeTab"
        >
            <template #data>
                <p-data-table :fields="fields"
                              :sortable="false"
                              :selectable="false"
                              :items="selectedRoles"
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

<script lang="ts">
import {
    computed, reactive, toRefs,
} from 'vue';

import {
    PEmpty, PTab, PDataTable, PBadge, PButton,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import type { TabItem } from '@spaceone/design-system/types/navigation/tabs/tab/type';

import { SpaceRouter } from '@/router';
import { i18n } from '@/translations';

import { ROLE_TYPE_BADGE_OPTION } from '@/services/administration/iam/role/config';
import RoleDetail from '@/services/administration/iam/role/modules/role-management-tab/RoleDetail.vue';
import type { RoleData } from '@/services/administration/iam/role/type';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { administrationStore } from '@/services/administration/store';

export default {
    name: 'RoleManagementTab',
    components: {
        PEmpty,
        PTab,
        PDataTable,
        PBadge,
        PButton,
        RoleDetail,
    },
    setup() {
        const state = reactive({
            loading: true,
            fields: computed<DataTableField[]>(() => ([
                { name: 'name', label: 'Name' },
                { name: 'tags.description', label: 'Description', sortable: false },
                { name: 'role_type', label: 'Role Type' },
                { name: 'created_at', label: 'Created', sortable: false },
                { name: 'edit_button', label: ' ', sortable: false },
            ])),
            selectedIndex: computed<number[]>(() => administrationStore.state.role.selectedIndices),
            selectedRoles: computed<RoleData[]>(() => administrationStore.state.role.selectedRoles),
            isSelected: computed<boolean>(() => administrationStore.getters['role/isRoleSelected']),
            selectedRoleId: computed(() => state.selectedRoles[0]?.role_id),
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

        const handleEditRole = (id: string) => { SpaceRouter.router.push({ name: ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME, params: { id } }); };

        return {
            ...toRefs(state),
            singleItemTabState,
            multiItemTabState,
            handleEditRole,
            ROLE_TYPE_BADGE_OPTION,
        };
    },

};
</script>

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
