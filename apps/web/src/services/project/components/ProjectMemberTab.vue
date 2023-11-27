<script lang="ts" setup>
import {
    computed, reactive, watch,
} from 'vue';

import {
    PButton,
    PHeading,
    PSelectDropdown,
    PTableCheckModal,
    PToolboxTable,
} from '@spaceone/design-system';
import type { DataTableField } from '@spaceone/design-system/types/data-display/tables/data-table/type';
import type { MenuItem } from '@spaceone/design-system/types/inputs/context-menu/type';

import { setApiQueryWithToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox';
import type { ToolboxOptions } from '@cloudforet/core-lib/component-util/toolbox/type';
import { SpaceConnector } from '@cloudforet/core-lib/space-connector';
import { ApiQueryHelper } from '@cloudforet/core-lib/space-connector/helper';

import { store } from '@/store';
import { i18n } from '@/translations';

import type { ProjectReferenceMap } from '@/store/modules/reference/project/type';
import type { UserReferenceMap } from '@/store/modules/reference/user/type';

import { showSuccessMessage } from '@/lib/helper/notice-alert-helper';

import ErrorHandler from '@/common/composables/error/errorHandler';

import ProjectMemberInviteModal from '@/services/project/components/ProjectMemberInviteModal.vue';
import type { ProjectMemberItem } from '@/services/project/types/project-member-type';


interface MemberDataTableItem extends ProjectMemberItem {
    user_id: string;
}

interface Props {
    projectId?: string;
    filters?: { k: string; v: string }[];
    manageDisabled?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
    projectId: '',
    filters: () => ([]),
    manageDisabled: false,
});
const emit = defineEmits<{(e: 'update-filters', filters: any): void;
}>();

const apiQueryHelper = new ApiQueryHelper().setPageLimit(15).setFilters(props.filters);
const storeState = reactive({
    users: computed<UserReferenceMap>(() => store.getters['reference/userItems']),
    projects: computed<ProjectReferenceMap>(() => store.getters['reference/projectItems']),
});
const state = reactive({
    searchText: apiQueryHelper.filters.map((d) => d.v).join(' ') || '',
    selectIndex: [] as number[],
    fields: [
        { label: 'User ID', name: 'user_id' },
        { label: 'User Name', name: 'resource_id' },
    ] as DataTableField[],
    items: [] as MemberDataTableItem[],
    loading: true,
    totalCount: 0,
    selectedItems: computed(() => state.selectIndex.map((i) => state.items[i])),
    dropdownMenu: computed(() => ([
        {
            type: 'item',
            name: 'delete',
            label: i18n.t('IDENTITY.USER.MAIN.DELETE'),
            disabled: !state.selectedItems.length || !!state.selectedItems.find((d) => !!d.project_group_info),
        },
    ] as MenuItem[])),
    memberInviteFormVisible: false,
});
const checkMemberDeleteState = reactive({
    fields: computed(() => [
        { name: 'resource_id', label: 'User ID' },
        { name: 'role_info.name', label: 'Role' },
    ]),
    visible: false,
});

/* Api */
const listMembers = async () => {
    state.loading = true;
    state.selectIndex = [];
    try {
        const res = await SpaceConnector.client.identity.project.member.list({
            project_id: props.projectId,
            query: apiQueryHelper.data,
            include_parent_member: true,
        });
        state.items = res.results.map((d) => ({
            ...d,
            user_id: d.resource_id,
        }));
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
        showSuccessMessage(i18n.t('PROJECT.DETAIL.ALT_S_DELETE_MEMBER'), '');
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
    state.memberInviteFormVisible = true;
};

const clickDeleteMember = () => {
    checkMemberDeleteState.visible = true;
};
const handleSelectDropdown = (name) => {
    switch (name) {
    case 'delete': clickDeleteMember(); break;
    default: break;
    }
};
const handleConfirmDeleteMember = async (items) => {
    await deleteProjectMember(items);

    checkMemberDeleteState.visible = false;
    await listMembers();
};
const handleConfirm = () => {
    listMembers();
};

/* Init */
(async () => {
    // LOAD REFERENCE STORE
    await Promise.allSettled([
        store.dispatch('reference/user/load'),
        store.dispatch('reference/project/load'),
    ]);
})();

/* Watcher */
watch(() => store.state.reference.project.items, (projects) => {
    if (projects) listMembers();
}, { immediate: true });
</script>

<template>
    <div class="project-member-tab">
        <p-toolbox-table :excel-visible="false"
                         selectable
                         sortable
                         :fields="state.fields"
                         :items="state.items"
                         :select-index.sync="state.selectIndex"
                         :loading="state.loading"
                         :total-count="state.totalCount"
                         :search-text="state.searchText"
                         @change="handleChangeTable"
                         @refresh="handleChangeTable()"
        >
            <template #toolbox-top>
                <p-heading heading-type="sub"
                           :title="$t('PROJECT.DETAIL.MEMBER_TITLE')"
                           use-total-count
                           :total-count="state.totalCount"
                />
            </template>
            <template #toolbox-left>
                <p-button style-type="primary"
                          class="mr-4 add-btn"
                          icon-left="ic_plus_bold"
                          :disabled="props.manageDisabled"
                          @click="handleClickInviteMember"
                >
                    {{ $t('PROJECT.DETAIL.MEMBER.INVITE') }}
                </p-button>
                <p-select-dropdown :menu="state.dropdownMenu"
                                   :disabled="props.manageDisabled"
                                   :placeholder="$t('IDENTITY.USER.MAIN.ACTION')"
                                   @select="handleSelectDropdown"
                />
            </template>
            <template #col-resource_id-format="{ value }">
                {{ storeState.users[value] ? storeState.users[value].name : value }}
            </template>
        </p-toolbox-table>

        <project-member-invite-modal
            v-if="state.memberInviteFormVisible"
            :visible.sync="state.memberInviteFormVisible"
            :project-id="projectId"
            @confirm="handleConfirm"
        />
        <p-table-check-modal :visible.sync="checkMemberDeleteState.visible"
                             theme-color="alert"
                             modal-size="md"
                             :fields="checkMemberDeleteState.fields"
                             :items="state.selectedItems"
                             :header-title="$t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_TITLE')"
                             :sub-title="$t('PROJECT.DETAIL.MODAL_DELETE_MEMBER_CONTENT')"
                             @confirm="handleConfirmDeleteMember"
        />
    </div>
</template>

<style lang="postcss" scoped>
.project-member-tab {
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
