<template>
    <section>
        <p-tab v-if="selectedIndex.length === 1" :tabs="singleItemTabState.tabs"
               :active-tab.sync="singleItemTabState.activeTab"
        >
            <template #detail />
        </p-tab>
        <p-tab v-else-if="selectedIndex.length > 1" :tabs="multiItemTabState.tabs"
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
                        <p-badge v-if="value" :outline="true" :style-type="ROLE_TYPE_BADGE_OPTION[value].styleType">
                            {{ ROLE_TYPE_BADGE_OPTION[value] ? ROLE_TYPE_BADGE_OPTION[value].label : '' }}
                        </p-badge>
                    </template>
                    <template #col-tags.description-format="{ value }">
                        {{ value ? value : '--' }}
                    </template>
                    <template #col-edit_button-format="{ item }">
                        <p-button size="sm"
                                  style-type="gray-border"
                                  :outline="true"
                                  font-weight="bold"
                                  @click="handleEditRole(item.role_id)"
                        >
                            <p-i class="mr-1" name="ic_edit"
                                 width="1rem" height="1rem"
                            />Edit
                        </p-button>
                    </template>
                </p-data-table>
            </template>
        </p-tab>
        <div v-else id="empty-space">
            <p-empty>{{ $t('IDENTITY.USER.MAIN.NO_SELECTED') }}</p-empty>
        </div>
    </section>
</template>

<script lang="ts">
/* eslint-disable camelcase */
import {
    computed, reactive, toRefs,
} from '@vue/composition-api';

import {
    PEmpty, PTab, PDataTable, PI, PBadge, PButton,
} from '@spaceone/design-system';

import { TabItem } from '@spaceone/design-system/dist/src/navigation/tabs/tab/type';
import { i18n } from '@/translations';
import { RoleData } from '@/services/administration/iam/role/type';
import { administrationStore } from '@/services/administration/store';
import { ROLE_TYPE_BADGE_OPTION } from '@/services/administration/iam/role/config';
import { SpaceRouter } from '@/router';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';


export default {
    name: 'RoleManagementTab',
    components: {
        PEmpty,
        PTab,
        PDataTable,
        PI,
        PBadge,
        PButton,
    },
    setup() {
        const state = reactive({
            loading: true,
            roles: [] as RoleData[],
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
        });

        const singleItemTabState = reactive({
            tabs: computed<TabItem[]>(() => ([
                // song-lang: USER에서도 똑같이 사용되고 있는데 혹시 몰라 주석 남깁니다!
                { label: i18n.t('IDENTITY.USER.MAIN.DETAILS'), name: 'detail', keepAlive: true },
            ])),
            activeTab: 'detail',
        });

        const multiItemTabState = reactive({
            tabs: computed<TabItem[]>(() => ([
                // song-lang: USER에서도 똑같이 사용되고 있는데 혹시 몰라 주석 남깁니다!
                { name: 'data', label: i18n.t('IDENTITY.USER.MAIN.TAB_SELECTED_DATA'), keepAlive: true },
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

.api-key-table::v-deep {
    .main-table-wrapper {
        border: 0;
    }
}
</style>
