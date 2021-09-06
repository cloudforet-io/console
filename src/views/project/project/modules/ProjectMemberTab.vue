<template>
    <div class="member-tab">
        <p-toolbox-table :excel-visible="false"
                         selectable
                         sortable
                         :fields="memberTableState.fields"
                         :items="memberTableState.items"
                         :select-index.sync="memberTableState.selectIndex"
                         :loading="memberTableState.loading"
                         :total-count="memberTableState.totalCount"
                         @change="onChangeMemberTable"
                         @refresh="onChangeMemberTable()"
        >
            <template #toolbox-top>
                <p-panel-top :title="$t('PROJECT.DETAIL.MEMBER_TITLE')" use-total-count :total-count="memberTableState.totalCount" />
            </template>
            <template #toolbox-left>
                <p-icon-text-button style-type="primary-dark" class="mr-4 add-btn"
                                    name="ic_plus_bold"
                                    @click="openMemberAddForm()"
                >
                    {{ $t('PROJECT.DETAIL.ADD') }}
                </p-icon-text-button>
                <p-select-dropdown :items="memberTableState.dropdownMenu"
                                   @select="onSelectDropdown"
                >
                    {{ $t('IDENTITY.USER.MAIN.ACTION') }}
                </p-select-dropdown>
            </template>
            <template #col-resource_id-format="{ value }">
                {{ memberTableState.users[value].name }}
            </template>
            <template #col-assigned-format="{ value }">
                <p-anchor :to="projectLinkFormatter(value)"
                          target="_blank"
                >
                    {{ value.name }}
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
        <project-member-update-modal v-if="memberUpdateFormVisible" :visible.sync="memberUpdateFormVisible" :selected-member="memberTableState.selectedItems[0]"
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
    PBadge, PAnchor, PIconTextButton, PPanelTop, PSelectDropdown, PTableCheckModal, PToolboxTable,
} from '@spaceone/design-system';

import { ApiQueryHelper } from '@spaceone/console-core-lib/space-connector/helper';
import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import { MenuItem } from '@spaceone/design-system/dist/src/inputs/context-menu/type';
import { SpaceConnector } from '@spaceone/console-core-lib/space-connector';

import { TranslateResult } from 'vue-i18n';
import { showErrorMessage, showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ProjectMemberAddModal from '@/views/project/project/modules/ProjectMemberAddModal.vue';
import ProjectMemberUpdateModal from '@/views/project/project/modules/ProjectMemberUpdateModal.vue';
import { Tags, TimeStamp } from '@/models';


interface MemberItem {
    created_at?: TimeStamp;
    domain_id?: string;
    labels: string[];
    project_info?: object;
    project_group_info?: object;
    resource_id?: string;
    resource_type?: string;
    role_binding_id?: string;
    role_info?: object;
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
        PIconTextButton,
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
    },
    setup(props, { root }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;

        // List api Handler for query search table
        const memberTableQuery = new ApiQueryHelper().setPageLimit(15);
        const memberTableState = reactive({
            users: computed(() => vm.$store.state.resource.user.items),
            selectIndex: [] as number[],
            fields: [
                { label: 'User ID', name: 'user_id', type: 'item' },
                { label: 'User Name', name: 'resource_id', type: 'item' },
                { label: 'Role', name: 'role_info.name', type: 'item' },
                {
                    label: 'Assigned', name: 'assigned', type: 'item', sortable: false,
                },
                { label: 'Labels', name: 'labels', type: 'item' },
            ],
            items: [] as MemberItem[],
            loading: true,
            totalCount: 0,
            selectedItems: computed(() => memberTableState.selectIndex.map(i => memberTableState.items[i])),
            isSelected: computed(() => memberTableState.selectIndex.length > 0),
            dropdownMenu: computed(() => ([
                {
                    type: 'item',
                    name: 'update',
                    label: vm.$t('IDENTITY.USER.MAIN.UPDATE'),
                    disabled: memberTableState.selectIndex.length > 1 || !memberTableState.isSelected || !!memberTableState.selectedItems.find(d => !!d.project_group_info),
                },
                {
                    type: 'item',
                    name: 'delete',
                    label: vm.$t('IDENTITY.USER.MAIN.DELETE'),
                    disabled: !memberTableState.isSelected || !!memberTableState.selectedItems.find(d => !!d.project_group_info),
                },
            ] as MenuItem[])),
        });

        const formState = reactive({
            updateMode: false,
            headerTitle: '' as TranslateResult,
            themeColor: '',
            memberAddFormVisible: false,
            memberDeleteFormVisible: false,
            memberUpdateFormVisible: false,
        });

        /* util */
        const projectLinkFormatter = (data) => {
            if (data.project_id) {
                return referenceRouter(data.project_id, { resource_type: 'identity.Project' });
            }
            return referenceRouter(data.project_group_id, { resource_type: 'identity.ProjectGroup' });
        };

        const listMemberApi = async () => {
            const res = await SpaceConnector.client.identity.project.member.list({
                project_id: props.projectId,
                query: memberTableQuery.data,
                include_parent_member: true,
            });
            return res;
        };
        const listGroupMemberApi = async () => {
            const res = await SpaceConnector.client.identity.projectGroup.member.list({
                project_group_id: props.projectGroupId,
                query: memberTableQuery.data,
            });
            return res;
        };

        const listMembers = async () => {
            memberTableState.loading = true;
            memberTableState.selectIndex = [];
            let res = [] as unknown as MemberListApiResponse;
            try {
                if (props.isProjectGroup) res = await listGroupMemberApi();
                else res = await listMemberApi();
                memberTableState.items = res.results.map(d => ({
                    ...d,
                    user_id: d.resource_id,
                    assigned: d.project_group_info ? d.project_group_info : d.project_info,
                }));
                memberTableState.totalCount = res.total_count;
            } catch (e) {
                memberTableState.items = [];
                memberTableState.totalCount = 0;
                console.error(e);
            } finally {
                memberTableState.loading = false;
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
                memberTableQuery.setFilters([{ v: changed.searchText }]);
            }
            await listMembers();
        };

        const openMemberAddForm = () => {
            formState.memberAddFormVisible = true;
        };

        const onAddMemberConfirm = async () => {
            await listMembers();
        };

        const openMemberUpdateForm = () => {
            formState.memberUpdateFormVisible = true;
        };

        const onUpdateMemberConfirm = async () => {
            await listMembers();
        };

        const checkMemberDeleteState = reactive({
            fields: computed(() => [
                { name: 'resource_id', label: 'User ID' },
                // { name: '-', label: 'User Name' },
                { name: 'role_info.name', label: 'Role' },
                // { name: 'labels', label: 'Labels' },
            ]),
            mode: '',
            items: [] as MemberItem[],
            headerTitle: '' as TranslateResult,
            subTitle: '' as TranslateResult,
            themeColor: '',
            visible: false,
        });

        const memberDeleteClick = () => {
            checkMemberDeleteState.mode = 'delete';
            checkMemberDeleteState.items = memberTableState.selectedItems as MemberItem[];
            checkMemberDeleteState.headerTitle = vm.$t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_TITLE');
            checkMemberDeleteState.subTitle = vm.$t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_CONTENT');
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
            showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_DELETE_MEMBER'), '', root);
        };

        const deleteProjectGroupMember = async (items) => {
            await SpaceConnector.client.identity.projectGroup.member.remove({
                project_group_id: props.projectGroupId,
                users: items.map(it => it.resource_id),
            });
            showSuccessMessage(vm.$t('PROJECT.DETAIL.ALT_S_DELETE_MEMBER'), '', root);
        };

        const memberDeleteConfirm = async (items) => {
            try {
                if (props.isProjectGroup) await deleteProjectGroupMember(items);
                else await deleteProjectMember(items);
            } catch (e) {
                showErrorMessage(vm.$t('PROJECT.DETAIL.ALT_E_DELETE_MEMBER'), e, root);
            } finally {
                checkMemberDeleteState.visible = false;
                await listMembers();
            }
        };

        (async () => {
            await vm.$store.dispatch('resource/user/load');
            await listMembers();
        })();


        return {
            ...toRefs(formState),
            memberTableState,
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
