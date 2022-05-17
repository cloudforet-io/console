<template>
    <div class="member-tab">
        <p-toolbox-table :excel-visible="false"
                         selectable
                         sortable
                         :fields="fields"
                         :items="items"
                         :select-index.sync="selectIndex"
                         :loading="loading"
                         :total-count="totalCount"
                         :search-text="searchText"
                         @change="handleChangeTable"
                         @refresh="handleChangeTable()"
        >
            <template #toolbox-top>
                <p-panel-top :title="$t('PROJECT.DETAIL.MEMBER_TITLE')" use-total-count :total-count="totalCount" />
            </template>
            <template #toolbox-left>
                <p-button style-type="primary-dark" class="mr-4 add-btn"
                          icon="ic_plus_bold"
                          :disabled="!storeState.hasManagePermission"
                          @click="handleClickInviteMember"
                >
                    {{ $t('PROJECT.DETAIL.MEMBER.INVITE') }}
                </p-button>
                <p-select-dropdown :items="dropdownMenu"
                                   :disabled="!storeState.hasManagePermission"
                                   @select="handleSelectDropdown"
                >
                    {{ $t('IDENTITY.USER.MAIN.ACTION') }}
                </p-select-dropdown>
            </template>
            <template #col-resource_id-format="{ value, item }">
                {{ storeState.users[value] ? storeState.users[value].name : value }}
            </template>
            <template #col-assigned-format="{ value }">
                <p-anchor :to="projectLinkFormatter(value)">
                    {{ value }}
                </p-anchor>
            </template>
            <template #col-labels-format="{ value }">
                <p v-if="value.length === 0" />
                <p-badge v-for="(label, idx) in value" :key="idx" style-type="gray200"
                         class="mr-2"
                >
                    {{ label }}
                </p-badge>
            </template>
        </p-toolbox-table>

        <project-member-add-modal v-if="memberAddFormVisible" :visible.sync="memberAddFormVisible" :is-project-group="isProjectGroup"
                                  :project-id="projectId"
                                  :project-group-id="projectGroupId" @confirm="listMembers"
        />
        <project-member-update-modal v-if="memberUpdateFormVisible" :visible.sync="memberUpdateFormVisible" :selected-member="selectedItems[0]"
                                     :project-id="projectId"
                                     :is-project-group="isProjectGroup" :project-group-id="projectGroupId"
                                     @confirm="listMembers"
        />
        <p-table-check-modal
            mode="delete"
            theme-color="alert"
            size="md"
            :fields="checkMemberDeleteState.fields"
            :items="selectedItems"
            :header-title="$t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_TITLE')"
            :sub-title="$t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_CONTENT')"
            :visible.sync="checkMemberDeleteState.visible"
            @confirm="handleConfirmDeleteMember"
        />
    </div>
</template>

<script lang="ts">
import {
    PAnchor,
    PBadge,
    PButton,
    PPanelTop,
    PSelectDropdown,
    PTableCheckModal,
    PToolboxTable,
} from '@spaceone/design-system';

import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import { computed, reactive, toRefs } from '@vue/composition-api';

import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ProjectMemberAddModal from '@/services/project/project-detail/project-member/modules/ProjectMemberAddModal.vue';
import ProjectMemberUpdateModal
    from '@/services/project/project-detail/project-member/modules/ProjectMemberUpdateModal.vue';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { i18n } from '@/translations';
import { store } from '@/store';
import { ToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox/type';
import { setApiQueryWithToolboxOptions } from '@spaceone/console-core-lib/component-util/toolbox';
import { MemberItem } from '@/services/project/project-detail/project-member/type';
import { DataTableField } from '@spaceone/design-system/dist/src/data-display/tables/data-table/type';


interface MemberDataTableItem extends MemberItem {
    user_id: string;
    assigned: string;
}

export default {
    name: 'ProjectMemberTab',
    components: {
        PAnchor,
        PToolboxTable,
        PPanelTop,
        PButton,
        PSelectDropdown,
        PBadge,
        PTableCheckModal,
        ProjectMemberAddModal,
        ProjectMemberUpdateModal,
    },
    props: {
        projectId: {
            type: String,
            default: '',
        },
        isProjectGroup: {
            type: Boolean,
            default: false,
        },
        projectGroupId: {
            type: String,
            default: '',
        },
        filters: {
            type: Array,
            default: () => [],
        },
    },
    setup(props, { root, emit }) {
        const apiQueryHelper = new ApiQueryHelper().setPageLimit(15).setFilters(props.filters);
        const storeState = reactive({
            users: computed(() => store.state.reference.user.items),
            projects: computed(() => store.state.reference.project.items),
            projectGroups: computed(() => store.state.reference.projectGroup.items),
            hasManagePermission: computed<boolean>(() => store.getters['user/hasManagePermission']),
        });
        const state = reactive({
            searchText: apiQueryHelper.filters.map(d => d.v).join(' ') || '',
            selectIndex: [] as number[],
            fields: [
                { label: 'User ID', name: 'user_id' },
                { label: 'User Name', name: 'resource_id' },
                { label: 'Role', name: 'role_info.name' },
                { label: 'Assigned', name: 'assigned', sortable: false },
                { label: 'Label', name: 'labels' },
            ] as DataTableField[],
            items: [] as MemberDataTableItem[],
            loading: true,
            totalCount: 0,
            selectedItems: computed(() => state.selectIndex.map(i => state.items[i])),
            dropdownMenu: computed(() => ([
                {
                    type: 'item',
                    name: 'update',
                    label: i18n.t('IDENTITY.USER.MAIN.UPDATE'),
                    disabled: state.selectIndex.length !== 1 || (
                        props.isProjectGroup
                            ? props.projectGroupId !== state.selectedItems[0]?.project_group_info?.project_group_id
                            : !!state.selectedItems[0]?.project_group_info
                    ),
                },
                {
                    type: 'item',
                    name: 'delete',
                    label: i18n.t('IDENTITY.USER.MAIN.DELETE'),
                    disabled: !state.selectedItems.length
                        || (
                            props.isProjectGroup
                                ? !!state.selectedItems.find(d => props.projectGroupId !== d.project_group_info?.project_group_id)
                                : !!state.selectedItems.find(d => !!d.project_group_info)
                        ),
                },
            ] as MenuItem[])),
            memberAddFormVisible: false,
            memberUpdateFormVisible: false,
        });
        const checkMemberDeleteState = reactive({
            fields: computed(() => [
                { name: 'resource_id', label: 'User ID' },
                { name: 'role_info.name', label: 'Role' },
            ]),
            visible: false,
        });

        /* Util */
        const projectLinkFormatter = (data) => {
            if (data.project_id) {
                return referenceRouter(data.project_id, { resource_type: 'identity.Project' });
            }
            return referenceRouter(data.project_group_id, { resource_type: 'identity.ProjectGroup' });
        };

        /* Api */
        const listMembers = async () => {
            state.loading = true;
            state.selectIndex = [];
            try {
                let res;
                if (props.isProjectGroup) {
                    res = await SpaceConnector.client.identity.projectGroup.member.list({
                        project_group_id: props.projectGroupId,
                        query: apiQueryHelper.data,
                    });
                } else {
                    res = await SpaceConnector.client.identity.project.member.list({
                        project_id: props.projectId,
                        query: apiQueryHelper.data,
                        include_parent_member: true,
                    });
                }
                state.items = res.results.map((d) => {
                    let assigned;
                    if (d.project_info) assigned = storeState.projects[d.project_info?.project_id]?.label;
                    else if (d.project_group_info) assigned = storeState.projectGroups[d.project_group_info.project_group_id]?.label;
                    return {
                        ...d,
                        user_id: d.resource_id,
                        assigned,
                    };
                });
                state.totalCount = res.total_count;
            } catch (e) {
                ErrorHandler.handleError(e);
                state.items = [];
                state.totalCount = 0;
            } finally {
                state.loading = false;
            }
        };
        const deleteProjectMember = async (items) => {
            try {
                await SpaceConnector.client.identity.project.member.remove({
                    project_id: props.projectId,
                    users: items.map(it => it.resource_id),
                });
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_DELETE_MEMBER'), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_DELETE_MEMBER'));
            }
        };
        const deleteProjectGroupMember = async (items) => {
            try {
                await SpaceConnector.client.identity.projectGroup.member.remove({
                    project_group_id: props.projectGroupId,
                    users: items.map(it => it.resource_id),
                });
                showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_DELETE_MEMBER'), '', root);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_DELETE_MEMBER'));
            }
        };

        /* Event */
        const handleChangeTable = async (options: ToolboxOptions = {}) => {
            setApiQueryWithToolboxOptions(apiQueryHelper, options);
            if (options.searchText !== undefined) {
                const filters = [{ v: options.searchText }];
                emit('update-filters', filters);
            }
            await listMembers();
        };
        const handleClickInviteMember = () => {
            state.memberAddFormVisible = true;
        };

        const clickDeleteMember = () => {
            checkMemberDeleteState.visible = true;
        };
        const clickUpdateMember = () => {
            state.memberUpdateFormVisible = true;
        };
        const handleSelectDropdown = (name) => {
            switch (name) {
            case 'delete': clickDeleteMember(); break;
            case 'update': clickUpdateMember(); break;
            default: break;
            }
        };
        const handleConfirmDeleteMember = async (items) => {
            if (props.isProjectGroup) await deleteProjectGroupMember(items);
            else await deleteProjectMember(items);

            checkMemberDeleteState.visible = false;
            await listMembers();
        };

        /* Init */
        (async () => {
            // LOAD REFERENCE STORE
            await Promise.allSettled([
                store.dispatch('reference/user/load'),
                store.dispatch('reference/project/load'),
                store.dispatch('reference/projectGroup/load'),
            ]);
            await listMembers();
        })();


        return {
            ...toRefs(state),
            storeState,
            checkMemberDeleteState,
            handleClickInviteMember,
            handleSelectDropdown,
            handleConfirmDeleteMember,
            listMembers,
            handleChangeTable,
            projectLinkFormatter,
        };
    },
};
</script>

<style lang="postcss" scoped>
.member-tab {
    .p-toolbox-table::v-deep {
        @apply border-none;
        .p-panel-top {
            height: auto;
            line-height: 1.6;
            margin-bottom: 0.5rem;
        }
    }
}
</style>
