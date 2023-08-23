<script lang="ts" setup>
import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox/type';
import type { ConsoleFilter } from '@cloudforet/core-lib/query/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';
import {
    PLink, PBadge, PButton, PHeading, PSelectDropdown, PTableCheckModal, PToolboxTable,
} from '@spaceone/design-system';
import { ACTION_ICON } from '@spaceone/design-system/src/inputs/link/type';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';
import {
    computed, reactive, watch,
} from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { ProjectGroupReferenceMap } from '@/store/modules/reference/project-group/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';
import { referenceRouter } from '@/lib/reference/referenceRouter';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ProjectMemberAddModal from '@/services/project/project-detail/project-member/modules/ProjectMemberAddModal.vue';
import ProjectMemberUpdateModal
    from '@/services/project/project-detail/project-member/modules/ProjectMemberUpdateModal.vue';
import type { MemberItem } from '@/services/project/project-detail/project-member/type';


interface MemberDataTableItem extends MemberItem {
    user_id: string;
    assigned: string;
}

interface Props {
    projectId: string;
    isProjectGroup: boolean;
    projectGroupId: string;
    filters: ConsoleFilter[];
    manageDisabled: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    projectId: '',
    isProjectGroup: false,
    projectGroupId: '',
    filters: () => [],
    manageDisabled: false,
});
const emit = defineEmits<{(e: 'update-filters', value: { v: string }[]): void}>();
const store = useStore();
const { t } = useI18n();

const apiQueryHelper = new ApiQueryHelper().setPageLimit(15).setFilters(props.filters);
const storeState = reactive({
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
    projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
    projectGroups: computed<ProjectGroupReferenceMap>(() => store.getters['reference/projectGroupItems']),
});
const state = reactive({
    searchText: apiQueryHelper.filters.map((d) => d.v).join(' ') || '',
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
    selectedItems: computed(() => state.selectIndex.map((i) => state.items[i])),
    dropdownMenu: computed(() => ([
        {
            type: 'item',
            name: 'update',
            label: t('IDENTITY.USER.MAIN.UPDATE'),
            disabled: state.selectIndex.length !== 1 || (
                props.isProjectGroup
                    ? props.projectGroupId !== state.selectedItems[0]?.project_group_info?.project_group_id
                    : !!state.selectedItems[0]?.project_group_info
            ),
        },
        {
            type: 'item',
            name: 'delete',
            label: t('IDENTITY.USER.MAIN.DELETE'),
            disabled: !state.selectedItems.length
                        || (
                            props.isProjectGroup
                                ? !!state.selectedItems.find((d) => props.projectGroupId !== d.project_group_info?.project_group_id)
                                : !!state.selectedItems.find((d) => !!d.project_group_info)
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
const listMembers = async (projects: ProjectReferenceMap) => {
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
            if (d.project_info) assigned = projects[d.project_info?.project_id]?.label;
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
            users: items.map((it) => it.resource_id),
        });
        showSuccessMessage(t('PROJECT.DETAIL.ALT_S_DELETE_MEMBER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.DETAIL.ALT_E_DELETE_MEMBER'));
    }
};
const deleteProjectGroupMember = async (items) => {
    try {
        await SpaceConnector.client.identity.projectGroup.member.remove({
            project_group_id: props.projectGroupId,
            users: items.map((it) => it.resource_id),
        });
        showSuccessMessage(t('PROJECT.DETAIL.ALT_S_DELETE_MEMBER'), '');
    } catch (e) {
        ErrorHandler.handleRequestError(e, t('PROJECT.DETAIL.ALT_E_DELETE_MEMBER'));
    }
};

/* Event */
const handleChangeTable = async (options: ToolboxOptions = {}) => {
    setApiQueryWithToolboxOptions(apiQueryHelper, options);
    if (options.searchText !== undefined) {
        const filters = [{ v: options.searchText }];
        emit('update-filters', filters);
    }
    await listMembers(storeState.projects);
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
    await listMembers(storeState.projects);
};
const handleConfirm = () => {
    listMembers(storeState.projects);
};

/* Init */
(async () => {
    // LOAD REFERENCE STORE
    await Promise.allSettled([
        store.dispatch('reference/user/load'),
        store.dispatch('reference/project/load'),
        store.dispatch('reference/projectGroup/load'),
    ]);
})();

/* Watcher */
watch(() => store.state.reference.project.items, (projects) => {
    if (projects) listMembers(projects);
}, { immediate: true });

</script>

<template>
    <div class="member-tab">
        <p-toolbox-table v-model:select-index="state.selectIndex"
                         :excel-visible="false"
                         selectable
                         sortable
                         :fields="state.fields"
                         :items="state.items"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         :search-text="state.searchText"
                         @change="handleChangeTable"
                         @refresh="handleChangeTable()"
        >
            <template #toolbox-top>
                <p-heading heading-type="sub"
                           :title="t('PROJECT.DETAIL.MEMBER_TITLE')"
                           use-total-count
                           :total-count="state.totalCount"
                />
            </template>
            <template #toolbox-left>
                <p-button style-type="primary"
                          class="mr-4 add-btn"
                          icon-left="ic_plus_bold"
                          :disabled="manageDisabled"
                          @click="handleClickInviteMember"
                >
                    {{ t('PROJECT.DETAIL.MEMBER.INVITE') }}
                </p-button>
                <p-select-dropdown :items="state.dropdownMenu"
                                   :disabled="manageDisabled"
                                   @select="handleSelectDropdown"
                >
                    {{ t('IDENTITY.USER.MAIN.ACTION') }}
                </p-select-dropdown>
            </template>
            <template #col-resource_id-format="{ value }">
                {{ storeState.users[value] ? storeState.users[value].name : value }}
            </template>
            <template #col-assigned-format="{ value }">
                <p-link :action-icon="ACTION_ICON.INTERNAL_LINK"
                        new-tab
                        :to="projectLinkFormatter(value)"
                >
                    {{ value }}
                </p-link>
            </template>
            <template #col-labels-format="{ value }">
                <p v-if="value.length === 0" />
                <p-badge v-for="(label, idx) in value"
                         :key="idx"
                         style-type="gray200"
                         badge-type="subtle"
                         class="mr-2"
                >
                    {{ label }}
                </p-badge>
            </template>
        </p-toolbox-table>

        <project-member-add-modal v-if="state.memberAddFormVisible"
                                  v-model:visible="state.memberAddFormVisible"
                                  :is-project-group="isProjectGroup"
                                  :project-id="projectId"
                                  :project-group-id="projectGroupId"
                                  @confirm="handleConfirm"
        />
        <project-member-update-modal v-if="state.memberUpdateFormVisible"
                                     v-model:visible="state.memberUpdateFormVisible"
                                     :selected-member="state.selectedItems[0]"
                                     :project-id="projectId"
                                     :is-project-group="isProjectGroup"
                                     :project-group-id="projectGroupId"
                                     @confirm="handleConfirm"
        />
        <p-table-check-modal v-model:visible="checkMemberDeleteState.visible"
                             theme-color="alert"
                             modal-size="md"
                             :fields="checkMemberDeleteState.fields"
                             :items="state.selectedItems"
                             :header-title="t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_TITLE')"
                             :sub-title="t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_CONTENT')"
                             @confirm="handleConfirmDeleteMember"
        />
    </div>
</template>

<style lang="postcss" scoped>
.member-tab {
    /* custom design-system component - p-toolbox-table */
    :deep(.p-toolbox-table) {
        @apply border-none;
        .p-heading {
            height: auto;
            line-height: 1.6;
            margin-bottom: 0.5rem;
        }
    }
}
</style>
