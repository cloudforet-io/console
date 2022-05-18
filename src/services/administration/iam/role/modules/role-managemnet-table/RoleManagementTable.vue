<template>
    <section class="role-management-table">
        <p-toolbox-table search-type="query"
                         sortable
                         selectable
                         exportable
                         sort-by:="name"
                         :loading="loading"
                         :items="roles"
                         :select-index.sync="selectedIndices"
                         :fields="fields"
                         :sort-desc="true"
                         :total-count="totalCount"
                         :style="{height: `${tableHeight}px`}"
                         :key-item-sets="roleSearchHandler.keyItemSets"
                         :value-handler-map="roleSearchHandler.valueHandlerMap"
                         :query-tags="tags"
                         @select="handleSelect"
                         @change="handleChange"
                         @refresh="handleChange()"
                         @export="handleExport"
        >
            <template slot="toolbox-left">
                <p-button style-type="primary-dark"
                          icon="ic_plus_bold"
                          :disabled="!hasManagePermission"
                          @click="handleCreateRole"
                >
                    {{ $t('IAM.ROLE.CREATE') }}
                </p-button>
                <p-select-dropdown class="left-toolbox-item-select-dropdown"
                                   :items="dropdownMenu"
                                   :disabled="!hasManagePermission"
                                   @select="handleSelectDropdown"
                >
                    {{ $t('IAM.ROLE.ACTION') }}
                </p-select-dropdown>
            </template>
            <template #col-role_type-format="{ value }">
                <p-badge v-if="value" :outline="true" :style-type="ROLE_TYPE_BADGE_OPTION[value].styleType">
                    {{ ROLE_TYPE_BADGE_OPTION[value] ? ROLE_TYPE_BADGE_OPTION[value].label : '' }}
                </p-badge>
            </template>
            <template #col-tags.description-format="{ value }">
                <div class="description">
                    {{ value ? value : '--' }}
                </div>
            </template>
            <template #col-edit_button-format="{ item }">
                <p-button size="sm"
                          style-type="gray-border"
                          :outline="true"
                          font-weight="bold"
                          :disabled="!hasManagePermission"
                          @click="handleEditRole(item.role_id)"
                >
                    <p-i class="mr-1" name="ic_edit"
                         width="1rem" height="1rem"
                         color="inherit"
                    />{{ $t('IAM.ROLE.EDIT') }}
                </p-button>
            </template>
        </p-toolbox-table>
        <role-delete-modal :visible.sync="deleteModalVisible"
                           :roles="selectedRoles"
                           @refresh="handleChange"
        />
    </section>
</template>

<script lang="ts">
import {
    computed, defineComponent, reactive, toRefs, watch,
} from '@vue/composition-api';

import {
    PHorizontalLayout, PPageTitle, PToolboxTable, PSelectDropdown,
    PBadge, PButton, PI,
} from '@spaceone/design-system';
import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { SpaceRouter } from '@/router';
import { ADMINISTRATION_ROUTE } from '@/services/administration/route-config';
import { RoleData } from '@/services/administration/iam/role/type';
import { ToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox/type';
import { getApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { ROLE_TYPE_BADGE_OPTION, ROLE_TYPE_LABEL } from '@/services/administration/iam/role/config';
import { store } from '@/store';
import { FILE_NAME_PREFIX } from '@/lib/excel-export';
import { administrationStore } from '@/services/administration/store';
import RoleDeleteModal
    from '@/services/administration/iam/role/modules/role-managemnet-table/modules/RoleDeleteModal.vue';
import { KeyItem } from '@spaceone/console-core-lib/component-util/query-search/type';
import { makeDistinctValueHandler, makeEnumValueHandler } from '@spaceone/console-core-lib/component-util/query-search';
import { replaceUrlQuery } from '@/lib/router-query-string';
import { i18n } from '@/translations';

const DEFAULT_PAGE_LIMIT = 15;

export default defineComponent({
    name: 'RolePage',
    components: {
        RoleDeleteModal,
        PHorizontalLayout,
        PPageTitle,
        PToolboxTable,
        PSelectDropdown,
        PBadge,
        PButton,
        PI,
    },
    props: {
        tableHeight: {
            type: Number,
            default: 400,
        },
    },
    setup(props, { emit }) {
        const currentRoute = SpaceRouter.router.currentRoute;
        const roleListApiQueryHelper = new ApiQueryHelper()
            .setPageStart(1).setPageLimit(DEFAULT_PAGE_LIMIT)
            .setSort('name', true)
            .setFiltersAsRawQueryString(currentRoute.query?.filters);

        const roleSearchHandler = reactive({
            keyItemSets: [{
                title: 'Properties',
                items: [
                    { name: 'name', label: 'Name' },
                    { name: 'tags.description', label: 'Description' },
                    { name: 'role_type', label: 'Role Type' },
                    { name: 'created_at', label: 'Created' },
                ] as KeyItem[],
            }],
            valueHandlerMap: {
                name: makeDistinctValueHandler('identity.Role', 'name'),
                role_type: makeEnumValueHandler(ROLE_TYPE_LABEL),
                'tags.description': makeDistinctValueHandler('identity.Role', 'tags.description'),
                created_at: makeDistinctValueHandler('identity.Role', 'created_at'),
            },
        });
        const state = reactive({
            hasManagePermission: computed<boolean>(() => store.getters['user/hasManagePermission']),
            loading: false,
            totalCount: 0,
            dropdownMenu: computed(() => ([
                {
                    type: 'item',
                    name: 'edit',
                    label: i18n.t('IAM.ROLE.EDIT'),
                    disabled: state.selectedIndices.length > 1 || !state.isSelected,
                },
                {
                    type: 'item', name: 'delete', label: i18n.t('IAM.ROLE.DELETE'), disabled: !state.isSelected,
                },
            ] as MenuItem[])),
            roles: [] as RoleData[],
            fields: [
                { name: 'name', label: 'Name' },
                { name: 'tags.description', label: 'Description', sortable: false },
                { name: 'role_type', label: 'Role Type' },
                { name: 'created_at', label: 'Created', sortable: false },
                { name: 'edit_button', label: ' ', sortable: false },
            ],
            excelFields: [
                { key: 'name', name: 'Name' },
                { key: 'tags.description', name: 'Description' },
                { key: 'role_type', name: 'Role Type' },
                { key: 'created_at', name: 'Created' },
            ],
            deleteModalVisible: false,
            // selected
            selectedIndices: [] as number[],
            selectedRoles: computed<RoleData[]>(() => state.selectedIndices.map(d => state.roles[d]) || []),
            isSelected: computed(() => state.selectedIndices.length > 0),
            tags: roleListApiQueryHelper.setKeyItemSets(roleSearchHandler.keyItemSets).queryTags,
        });
        let roleListApiQuery = roleListApiQueryHelper.data;

        const listRoles = async () => {
            state.loading = true;
            try {
                const res = await SpaceConnector.client.identity.role.list({
                    query: roleListApiQuery,
                });
                state.roles = res.results;
                state.totalCount = res.total_count;
                state.selectedIndices = [];
            } catch (e) {
                ErrorHandler.handleError(e);
                state.roles = [];
                state.totalCount = 0;
            } finally {
                state.loading = false;
            }
        };

        const openDeleteModal = () => {
            state.deleteModalVisible = true;
        };
        // event
        const handleCreateRole = () => { SpaceRouter.router.push({ name: ADMINISTRATION_ROUTE.IAM.ROLE.CREATE._NAME }); };
        const handleEditRole = (id: string) => { SpaceRouter.router.push({ name: ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME, params: { id } }); };
        const handleSelectDropdown = (name) => {
            switch (name) {
            case 'edit':
                SpaceRouter.router.push({
                    name: ADMINISTRATION_ROUTE.IAM.ROLE.EDIT._NAME,
                    params: { id: state.selectedRoles[0].role_id },
                });
                break;
            case 'delete': openDeleteModal(); break;
            default: break;
            }
        };
        const handleSelect = (index) => { state.selectedIndices = index; };
        const handleChange = async (options: ToolboxOptions = {}) => {
            roleListApiQuery = getApiQueryWithToolboxOptions(roleListApiQueryHelper, options) ?? roleListApiQuery;
            if (options.queryTags !== undefined) {
                await replaceUrlQuery('filters', roleListApiQueryHelper.rawQueryStrings);
            }
            await listRoles();
        };
        const handleExport = async () => {
            try {
                await store.dispatch('file/downloadExcel', {
                    url: '/identity/role/list',
                    param: {
                        query: roleListApiQueryHelper.data,
                    },
                    fields: state.excelFields,
                    file_name_prefix: FILE_NAME_PREFIX.role,
                });
            } catch (e) {
                ErrorHandler.handleError(e);
            }
        };
        watch(() => state.selectedIndices, (indices: number[]) => {
            emit('update-selected-indices', indices);
        });
        watch(() => state.totalCount, (totalCount: number) => {
            emit('update-total-count', totalCount);
        });
        (async () => {
            await listRoles();
        })();

        const saveSelectedValueToStore = (selectedIndices: number[]) => {
            administrationStore.dispatch('role/selectIndices', selectedIndices);
            administrationStore.dispatch('role/selectRoles', state.selectedRoles);
        };

        watch(() => state.selectedIndices, (after) => {
            saveSelectedValueToStore(after);
        });

        return {
            ...toRefs(state),
            roleSearchHandler,
            ROLE_TYPE_BADGE_OPTION,
            handleCreateRole,
            handleEditRole,
            handleSelectDropdown,
            handleSelect,
            handleChange,
            handleExport,
        };
    },

});
</script>

<style lang="postcss" scoped>
.left-toolbox-item-select-dropdown {
    margin-left: 1rem;
}
.description {
    @apply truncate;
    width: 25ch;
}
</style>
