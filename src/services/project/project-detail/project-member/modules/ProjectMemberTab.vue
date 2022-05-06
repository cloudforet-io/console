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
                         @change="onChangeMemberTable"
                         @refresh="onChangeMemberTable()"
        >
            <template #toolbox-top>
                <p-panel-top :title="$t('PROJECT.DETAIL.MEMBER_TITLE')" use-total-count :total-count="totalCount" />
            </template>
            <template #toolbox-left>
                <p-button style-type="primary-dark" class="mr-4 add-btn"
                          icon="ic_plus_bold"
                          @click="openMemberAddForm()"
                >
                    <!-- song-lang -->
                    Invite
                </p-button>
                <p-select-dropdown :items="dropdownMenu"
                                   @select="onSelectDropdown"
                >
                    {{ $t('IDENTITY.USER.MAIN.ACTION') }}
                </p-select-dropdown>
            </template>
            <template #col-resource_id-format="{ value, item }">
                {{ users[value] ? users[value].name : value }}
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
                                  :project-group-id="projectGroupId" @confirm="onAddMemberConfirm()"
        />
        <project-member-update-modal v-if="memberUpdateFormVisible" :visible.sync="memberUpdateFormVisible" :selected-member="selectedItems[0]"
                                     :is-project-group="isProjectGroup" :project-group-id="projectGroupId"
                                     @confirm="onAddMemberConfirm"
        />
        <p-table-check-modal
            :fields="checkMemberDeleteState.fields"
            :mode="checkMemberDeleteState.mode"
            :items="checkMemberDeleteState.items"
            :header-title="checkMemberDeleteState.headerTitle"
            :sub-title="checkMemberDeleteState.subTitle"
            :theme-color="checkMemberDeleteState.themeColor"
            size="md"
            :visible.sync="checkMemberDeleteState.visible"
            @confirm="memberDeleteConfirm"
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

import { TranslateResult } from 'vue-i18n';
import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ProjectMemberAddModal from '@/services/project/project-detail/project-member/modules/ProjectMemberAddModal.vue';
import ProjectMemberUpdateModal
    from '@/services/project/project-detail/project-member/modules/ProjectMemberUpdateModal.vue';
import { Tags, TimeStamp } from '@/models';
import ErrorHandler from '@/common/composables/error/errorHandler';
import { i18n } from '@/translations';
import { store } from '@/store';


interface MemberItem {
    created_at?: TimeStamp;
    domain_id?: string;
    labels: string[];
    project_info?: any;
    project_group_info?: any;
    resource_id?: string;
    resource_type?: string;
    role_binding_id?: string;
    role_info?: any;
    tags?: Tags;
}
interface MemberListApiResponse {
    results: MemberItem[];
    total_count: number;
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
        // List api Handler for query search table
        const memberTableQuery = new ApiQueryHelper().setPageLimit(15).setFilters(props.filters);
        const state = reactive({
            users: computed(() => store.state.reference.user.items),
            projects: computed(() => store.state.reference.project.items),
            projectGroups: computed(() => store.state.reference.projectGroup.items),
            searchText: memberTableQuery.filters.map(d => d.v).join(' ') || '',
            selectIndex: [] as number[],
            fields: [
                { label: 'User ID', name: 'user_id', type: 'item' },
                { label: 'User Name', name: 'resource_id', type: 'item' },
                { label: 'Role', name: 'role_info.name', type: 'item' },
                {
                    label: 'Assigned', name: 'assigned', type: 'item', sortable: false,
                },
                { label: 'Label', name: 'labels', type: 'item' },
            ],
            items: [] as MemberItem[],
            loading: true,
            totalCount: 0,
            selectedItems: computed(() => state.selectIndex.map(i => state.items[i])),
            isSelected: computed(() => state.selectIndex.length > 0),
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

        /* util */
        const projectLinkFormatter = (data) => {
            if (data.project_id) {
                return referenceRouter(data.project_id, { resource_type: 'identity.Project' });
            }
            return referenceRouter(data.project_group_id, { resource_type: 'identity.ProjectGroup' });
        };

        const listMembers = async () => {
            state.loading = true;
            state.selectIndex = [];
            try {
                let res: MemberListApiResponse;
                if (props.isProjectGroup) {
                    res = await SpaceConnector.client.identity.projectGroup.member.list({
                        project_group_id: props.projectGroupId,
                        query: memberTableQuery.data,
                    });
                } else {
                    res = await SpaceConnector.client.identity.project.member.list({
                        project_id: props.projectId,
                        query: memberTableQuery.data,
                        include_parent_member: true,
                    });
                }
                state.items = res.results.map((d) => {
                    let assigned;
                    if (d.project_info) assigned = state.projects[d.project_info?.project_id]?.label;
                    else assigned = state.projectGroups[d.project_group_info.project_group_id]?.label;
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

        const onChangeMemberTable = async (changed: any = {}) => {
            if (changed.sortBy !== undefined) {
                memberTableQuery.setSort(changed.sortBy, changed.sortDesc);
            }
            if (changed.pageLimit !== undefined) {
                memberTableQuery.setPageLimit(changed.pageLimit);
            }
            if (changed.pageStart !== undefined) {
                memberTableQuery.setPageStart(changed.pageStart);
            }
            if (changed.searchText !== undefined) {
                const filters = [{ v: changed.searchText }];
                memberTableQuery.setFilters(filters);
                emit('update-filters', filters);
            }
            await listMembers();
        };

        const openMemberAddForm = () => {
            state.memberAddFormVisible = true;
        };

        const onAddMemberConfirm = async () => {
            await listMembers();
        };

        const openMemberUpdateForm = () => {
            state.memberUpdateFormVisible = true;
        };

        const onUpdateMemberConfirm = async () => {
            await listMembers();
        };

        const checkMemberDeleteState = reactive({
            fields: computed(() => [
                { name: 'resource_id', label: 'User ID' },
                { name: 'role_info.name', label: 'Role' },
            ]),
            mode: '',
            items: [] as MemberItem[],
            headerTitle: '' as TranslateResult,
            subTitle: '' as TranslateResult,
            themeColor: undefined as string | undefined,
            visible: false,
        });

        const memberDeleteClick = () => {
            checkMemberDeleteState.mode = 'delete';
            checkMemberDeleteState.items = state.selectedItems as MemberItem[];
            checkMemberDeleteState.headerTitle = i18n.t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_TITLE');
            checkMemberDeleteState.subTitle = i18n.t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_CONTENT');
            checkMemberDeleteState.themeColor = 'alert';
            checkMemberDeleteState.visible = true;
        };

        const onSelectDropdown = (name) => {
            switch (name) {
            case 'delete': memberDeleteClick(); break;
            case 'update': openMemberUpdateForm(); break;
            default: break;
            }
        };

        const deleteProjectMember = async (items) => {
            await SpaceConnector.client.identity.project.member.remove({
                project_id: props.projectId,
                users: items.map(it => it.resource_id),
            });
            showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_DELETE_MEMBER'), '', root);
        };

        const deleteProjectGroupMember = async (items) => {
            await SpaceConnector.client.identity.projectGroup.member.remove({
                project_group_id: props.projectGroupId,
                users: items.map(it => it.resource_id),
            });
            showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_DELETE_MEMBER'), '', root);
        };

        const memberDeleteConfirm = async (items) => {
            try {
                if (props.isProjectGroup) await deleteProjectGroupMember(items);
                else await deleteProjectMember(items);
            } catch (e) {
                ErrorHandler.handleRequestError(e, i18n.t('PROJECT.DETAIL.ALT_E_DELETE_MEMBER'));
            } finally {
                checkMemberDeleteState.visible = false;
                await listMembers();
            }
        };

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
            checkMemberDeleteState,
            openMemberAddForm,
            onAddMemberConfirm,
            onSelectDropdown,
            onUpdateMemberConfirm,
            memberDeleteConfirm,
            listMembers,
            onChangeMemberTable,
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
